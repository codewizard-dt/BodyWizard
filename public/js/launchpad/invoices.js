var currencyMap = {
	dollars: "$"
}, currencyLabels = ['$', 'dollars'];
var stripe = null, elements = null, card = null, currency;

var invoice = {
	current: {
		uid: null,
		line_items: [],
		notes: [],
		payments: [],
		appointment_id: null,
		remainder: null,
		total_charge: null,
		invoiced_to_user_id: null,
	},
	reset: () => {
		invoice.current = {
			uid: null,
			line_items: [],
			notes: [],
			payments: [],
			appointment_id: null,
			remainder: null,
			total_charge: null,
			invoiced_to_user_id: null,
		}
	},
	payments: {
		node: $("<div/>", { class: 'partialPayment flexbox left' }),
		add: function (payment = null) {
			var form = $("#AddPayment"), obj;

			if (payment && payment.currency != undefined) {
				paymentObj = payment;
			} else {
				obj = forms.retrieve(form);
				if (!obj) return false;
				paymentObj = invoice.payments.create();
			}
			invoice.current.payments.push(paymentObj);
			// log({paymentObj:paymentObj,payments:invoice.current.payments},'new payment');
			invoice.payments.updateList();
		},
		updateList: () => {
			let payments = invoice.current.payments;
			$(".partialPayment").remove();
			payments.forEach(payment => {
				let paymentEle = invoice.payments.node.clone(),
					type = payment.payment_method,
					title = `${type} - ${practice.info.currency.symbol}${payment.amount}`;
				if (type == 'card') title = `${payment.details.card_type} ${title}`;
				paymentEle.append(`<div>${title}</div>`);
				if (type == 'card') paymentEle.append('<div class="cardOptions flexbox"><span class="checkmark">✓</span></div>');
				else paymentEle.append('<div class="removePayment flexbox"><span>x</span></div>');
				paymentEle.insertBefore("#Remainder").on('click', '.removePayment', invoice.payments.remove);
			})
			resetForm($("#AddPayment"));
			invoice.payments.resetRemainder();
			autosave.trigger();
		},
		create: function () {
			let form = $("#AddPayment"),
				paymentMethod = justResponse(form.find('.payment_method')),
				amount = justResponse(form.find('.amount')).split(' '),
				amountNum = amount[0], currencySymbol = amount[1];
			let obj = {
				payment_method: paymentMethod,
				amount: amountNum,
				currency: currency,
				details: {},
			}
			if (paymentMethod == 'check') {
				obj.details['check_number'] = justResponse(form.find('.check'), false, null, true);
			} else if (paymentMethod == 'card') {
				var cardType = justResponse(form.find('.card_type'), false, null, true);
				obj.details['card_type'] = cardType;
			}
			return obj;
		},
		remove: function () {
			var payment = $(this).closest('.partialPayment'), total = $("#TotalCharge").data('value');
			let allPayments = invoice.current.payments,
				index = payment.index('.partialPayment');
			log({ payment, allPayments, index });
			allPayments.splice(index, 1);
			payment.remove();
			invoice.payments.resetRemainder();
			autosave.trigger();
		},
		resetRemainder: function () {
			let total = invoice.current.total_charge, payments = invoice.current.payments,
				remainder = payments.isEmpty() ? total : payments.map(payment => payment.amount).reduce((subtotal, amount) => subtotal - amount, total);

			invoice.current.remainder = remainder;
			log({ total, payments, remainder }, 'resetRemainder');

			// if (total == remainder) $("#AddPaymentBtn").fadeOut();
			$("#AddPayment").find('.amount').data('max', remainder).val(remainder);
			if (remainder < 0.01) {
				$("#AddPaymentLabel, #PaymentMethod").slideFadeOut();
				$("#Remainder").html('paid in full');
				$("#SaveInvoiceBtn").removeClass('disabled');
				$("#AddPaymentBtn").fadeOut();
			} else {
				$("#AddPaymentLabel, #PaymentMethod").slideFadeIn();
				$("#Remainder").html("<span>" + currency.symbol + Number(remainder).toFixed(2) + "</span> remaining");
				if ($("#Remainder").exists()) $("#SaveInvoiceBtn").addClass('disabled');
			}
		},
		updateTotalDue: function () {
			// let lineItems = invoice.current.line_items;
			let lineItems = invoice.current.line_items;
			let total = lineItems ? lineItems.map(line => line.subtotal).reduce((subtotal, amount) => subtotal + amount, 0) : 0;
			$("#TotalCharge").html(practice.info.currency.symbol + Number.parseFloat(total).toFixed(2));
			invoice.current.total_charge = Number(total);
			log({ lineItems: lineItems, total: invoice.current.total_charge }, 'updateTotalDue');
			invoice.payments.resetRemainder();
		},
		updateAmount: function () {
			// var total = $("#TotalCharge").data('value'), amount = $("#AddPayment").find('.amount'), current = Number(amount.val()), payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), remainder = $("#AddPayment").find('.amount').data('max');
			let remainder = invoice.current.remainder,
				amount = Number($("#AddPayment").find('.amount').val()),
				payments = invoice.current.payments,
				addBtn = $("#AddPaymentBtn");
			if (payments.isEmpty() && amount < remainder) {
				addBtn.fadeIn();
				$("#SaveInvoiceBtn").addClass('disabled');
			} else if (payments.isEmpty()) {
				addBtn.fadeOut();
				$("#SaveInvoiceBtn").removeClass('disabled');
			}
		},
		stripe: {
			api: null,
			elements: null,
			card: null,
			intent: null,
			openModal: function () {
				autosave.clearTimer();
				var name = $("#PatientName").text(), amount = $("#AddPayment").find('.amount').val();
				$("#StripePaymentDetails").text(name + " - " + currency.symbol + amount);
				blurTopMost("#StripeModal");
				invoice.payments.stripe.getIntent();
				// getPaymentIntent();
				// console.log(this);				
			},
			getIntent: function () {
				var amount = Number($("#AddPayment").find('.amount').val()), invoiceeId = $("#PatientName").data('userid'), stripeAmount = (currency.abbr == 'usd') ? amount * 100 : amount, invoiceId = $("#ApptInfo").data('invoiceid');
				data = {
					amount: stripeAmount,
					currency: currency.abbr
				};
				$.ajax({
					url: '/user/' + invoiceeId + '/invoice/' + invoiceId + '/get-payment-intent',
					method: "POST",
					data: { intent_options: data },
					success: function (data) {
						console.log(data);
						invoice.payments.stripe.intent = data;
						$("#ApptInfo").data('invoiceid', getUids('Invoice'));
						// $("#StripePaymentDetails").data('paymentIntent',data);
					}
				})
			},
			submitPayment: function () {
				var intent = invoice.payments.stripe.intent, card = invoice.payments.stripe.card;
				blurTopMost("#loading");
				invoice.payments.stripe.api.confirmCardPayment(intent.client_secret, {
					payment_method: {
						card: card,
						billing_details: {
							name: $("#PatientName").text()
						},
						metadata: {
							userid: intent.user_id,
							stripeid: intent.stripe_id
						}
					}
				}).then(function (result) {
					if (result.error) {
						// Show error to your customer (e.g., insufficient funds)
						feedback('Error Charging Card', result.error.message);
					} else {
						if (result.paymentIntent.status === 'succeeded') {
							// Set up a webhook or plugin to listen for the
							// payment_intent.succeeded event that handles any business critical
							// post-payment actions.
							var paymentDetails = {
								payment_intent_id: result.paymentIntent.id,
								payment_method: result.paymentIntent.payment_method,
								status: result.paymentIntent.status
							};
							invoice.payments.add();
							var payment = $(".partialPayment").last(), info = payment.data(), details = info.details;
							$.extend(details, paymentDetails);
							info.details = details;
							payment.data(info);
							// console.log(payment,info,details,paymentDetails,info,payment.data());
							blurTopMost("#checkmark", 400, unblurAll);
						}
					}
				});

			}
		}
	},
	lineItems: {
		node: null,
		add: lineItem => {
			let newLineEle = invoice.lineItems.node.clone(),
				section = lineItem.type,
				lastInSection = $(`.lineItem.${section}`).last();
			newLineEle.insertAfter(lastInSection).data(lineItem.data);
			newLineEle.find('.description').find('.value').text(lineItem.description);
			newLineEle.find('.price').text(currency.symbol + lineItem.price);
			newLineEle.find('.price').data('value', lineItem.price);
			newLineEle.find('.discount').find('.value').text(lineItem.discount);
			newLineEle.find('.Discount').val(lineItem.discount);
			newLineEle.find('.tax').find('.value').text(lineItem.tax);
			newLineEle.find('.Tax').val(lineItem.tax);
			invoice.current.line_items.push(lineItem);
		},
		update: () => {
			invoice.lineItems.updateEles();
			invoice.lineItems.updateObjs();
			invoice.payments.updateTotalDue();
			autosave.trigger();
		},
		updateEles: function () {
			var lineItems = $(".lineItem").not('.header');
			lineItems.each(function (l, lineItem) {
				var price = $(lineItem).find('.price').data('value'),
					discount = $(lineItem).find('.discount').find('.value').text(),
					currencySymbol = currency.symbol,
					subtotal = Number(price);
				if (discount.includes('%')) {
					discount = Number(discount.replace('-', '').replace('%', '')) / 100;
					subtotal -= price * discount;
				} else if (discount.includes(currencySymbol)) {
					discount = Number(discount.replace('-', '').replace(currencySymbol, ''));
					subtotal -= discount;
				}
				var tax = ($(lineItem).find('.tax').length == 0) ? 0 : $(lineItem).find('.tax').find('.value').text();
				if (tax.includes('%')) {
					tax = Number(tax.replace('%', '')) / 100;
					subtotal += subtotal * tax;
				}
				$(lineItem).find('.lineTotal').html(currencySymbol + subtotal.toFixed(2)).data('value', Number(subtotal));
			});
			// invoice.lineItems.updateObjs();
			// invoice.payments.updateTotalDue();
			// autosave.trigger();
		},
		updateObjs: function () {
			var lineItems = $(".lineItem").not('.header'), lines = [];
			lineItems.each(function () {
				var data = $(this).data();
				delete data.initialized;
				lines.push({
					description: $(this).find(".description").find('.value').text(),
					price: $(this).find(".price").data('value'),
					discount: $(this).find(".discount").find('.value').text(),
					tax: $(this).find(".tax").find('.value').text(),
					subtotal: $(this).find(".lineTotal").data('value'),
					type: $(this).siblings('.header').data('type'),
					data: data
				})
			});
			log({ lines }, 'lineItems retrieve');
			invoice.current.line_items = lines;
			return lines;
		}
	},
	summary: function () {
		var summary = $('<div/>', {
			html: "<div class='split50KeyValues list'></div>"
		}), lineItems = "", payments = "", hasCard = false;
		$.each(invoice.current.payments, function (x, p) {
			if (p.payment_method == 'card') hasCard = true;
			if (hasCard) {
				payments += "<div>" + p.currency.symbol + Number(p.amount).toFixed(2) + " - " + toTitleCase(p.details.card_type + " " + p.payment_method) + "</div>";
			} else {
				payments += "<div>" + p.currency.symbol + Number(p.amount).toFixed(2) + " - " + toTitleCase(p.payment_method) + "</div>";
			}
		})
		var prompt = "Save Invoice?";
		summary.find('.list').appendKeyValuePair('Patient', $("#PatientName").text());
		summary.find('.list').appendKeyValuePair('Payments', payments);
		summary.find('.list').appendKeyValuePair('Total Charge', "<span class='pink'>" + $('#TotalCharge').text() + "</span>");
		summary.append($('<h3 class="pink">' + prompt + '</h3>'));
		return summary;
	},
	autosave: function () {
		let data = {
			uid: invoice.current.uid,
			columns: {
				invoiced_to_user_id: invoice.current.invoiced_to_user_id,
				created_by_user_id: user.current.id,
				appointment_id: invoice.current.appointment_id,
				notes: invoice.current.notes,
				total_charge: invoice.current.total_charge,
				autosave: {
					line_items: invoice.current.line_items,
					payments: invoice.current.payments
				},
			},
		};
		// log({current:invoice.current,data:data},'invoice autosave data');
		return $.ajax({
			url: '/save/Invoice',
			method: 'POST',
			data: data,
		})
	},
	save: {
		confirm: function () {
			if ($(this).hasClass('disabled')) return false;
			confirm({
				header: 'Confirm Payment Summary',
				message: invoice.summary(),
				btntext_yes: 'settle and close invoice',
				btntext_no: 'dismiss',
				callback_affirmative: invoice.save.ajax,
			})
			$("#InvoiceSummary").replaceWith(invoice.summary);
		},
		ajax: function () {
			blurTop('#loading');
			autosave.clearTimer();
			// console.log(invoice.current);
			let data = {
				uid: invoice.current.uid,
				columns: {
					invoiced_to_user_id: invoice.current.invoiced_to_user_id,
					created_by_user_id: user.current.id,
					appointment_id: invoice.current.appointment_id,
					notes: invoice.current.notes,
					total_charge: invoice.current.total_charge,
					line_items: invoice.current.line_items,
					payments: invoice.current.payments,
					settled_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				},
			};

			$.ajax({
				url: '/save/Invoice/',
				method: 'POST',
				data: data,
				success: function (data, status, request) {
					log({ data, status, request });
					system.validation.xhr.headers.check(request);
					blurTop('#checkmark', {
						callback: function () {
							// log({data},'should be callback');
							unblurAll({ fade: 800 });
							$("#invoice-index").click();
						},
						delay: 1500
					})
				}
			})
		}
	},
	view: {
		modal: function (uid) {
			blurTopMost("#loading");
			$.ajax({
				url: '/Invoice/' + uid + '/view',
				method: "GET",
				success: function (data) {
					// console.log('"viewNote" load');
					if ($("#Invoice").exists()) {
						$("#Invoice").html(data).attr('class', 'modalForm signed');
					} else {
						$("<div/>", { id: "Invoice", class: 'modalForm signed', html: data }).appendTo('body');
					}
					blurTopMost('#Invoice');
					// initializeNewForms();
					// initializeChartNotePage();
					// invoice.initialize.all();
				}
			})
		},
		optionsNavClick: function () { invoice.view.modal($("#CurrentInvoice").data('uid')); },
		// apptInfoClick: function(){invoice.view.modal($)}
	},
	edit: function () {
		unblurAll({ fade: 800 });
		$("#invoice-create").click();
	},

	autofill: {
		onload: function () {
			if ($("#Invoice").dne()) return;
			if (!$("#Invoice").hasClass('settled') && !$('#ApptInfo').data()) return;

			let data = $("#ApptInfo").data();
			for (attr in data) {
				invoice.current[attr] = data[attr];
			}
			notes.autofill(invoice.current.notes);
			let autosaveData = invoice.current.autosave;
			log({ autosaveData });
			if (autosaveData && autosaveData.line_items) invoice.autofill.lineItems(autosaveData.line_items);
			else invoice.autofill.lineItems(invoice.lineItems.updateObjs());
			if (autosaveData && autosaveData.payments) invoice.autofill.payments(autosaveData.payments);
			log({ lines: invoice.current.line_items });
			if ($("#Remainder").exists()) $("#AddPaymentBtn").slideFadeIn();
			setTimeout(autosave.clearTimer, 1000);
		},
		lineItems: function (autosavedLines) {
			$(".lineItem").not('.header').remove();
			log({ autosavedLines });
			autosavedLines.forEach(newLine => invoice.lineItems.add(newLine));
			invoice.initialize.lineItems();
			invoice.lineItems.update();
		},
		notes: function () { },
		payments: function (autosavedPayments) {
			$.each(autosavedPayments, function (p, payment) {
				invoice.payments.add(payment);
			});
		},
	},
	initialize: {
		all: function () {
			if ($("#Invoice").dne()) return;
			invoice.reset();
			if (!invoice.lineItems.node) {
				let proxy = $(".lineItem").not('.header').first();
				if (proxy.exists())
					invoice.lineItems.node = proxy.clone(true, true).removeData().attr('class', 'lineItem flexbox');
			}

			notes.resetForm();
			currency = $("#PaymentDetails").data('currency');
			$.each(invoice.initialize, function (name, initFunc) {
				if (name != 'all' && typeof initFunc === 'function') initFunc();
			});
			appointment.initialize.externalSelectAndLoad({
				target: $("#Invoice"),
				url: "/appointment/apptId/edit-invoice",
				callback: null,
				btnText: { hasInvoice: 'edit invoice', noInvoice: 'create invoice' },
			});

			invoice.autofill.onload();
			if (!$("#CurrentAppt").exists()) $(".selectNewAppt").click();
			else invoice.current.appointment_id = $("#CurrentAppt").data('uid');
		},
		buttons: () => {
			init([
				['#SaveInvoiceBtn', 'hasSaveFx', function () {
					$(this).on('click', function () {
						invoice.save.confirm();
						autosave.trigger();
					});
				}]
			]);
		},
		payments: function () {
			minifyForm("#AddPayment");
			var amountInput = filterByData($("#AddPayment").find('.number'), 'hasInvoiceFx', false);
			amountInput.each(function () {
				var input = $(this).find('input'), label = $(this).find('.label'), newLabelText = currencyMap[label.text()], total = $("#TotalCharge").data('value');
				input.val(total);
				input.data('max', total);
				label.insertBefore(input).text(newLabelText);
				$(this).on('touchend mouseup', '.change', function () {
					setTimeout(invoice.payments.updateAmount, 500);
				});
				$(this).on('focusout', 'input', function () {
					setTimeout(invoice.payments.updateAmount, 500);
				});
				$("<div/>", {
					class: 'button xsmall pink',
					id: 'AddPaymentBtn',
					text: 'add payment',
					css: { margin: '0.5em 0.5em 0.5em 1.5em' }
				}).appendTo($(this)).hide().on('click', invoice.payments.add);
			});
			amountInput.data('hasInvoiceFx', true);
			var stripeBtn = filterByData($('li').filter("[data-value='Stripe']"), 'hasStripeModalFx', false);
			stripeBtn.on('click', invoice.payments.stripe.openModal);
			stripeBtn.data('hasStripeModalFx', true);
			var stripeModal = filterByData($('#StripeModal'), 'hasStripeModalFx', false);
			stripeModal.on('click', '.cancel', function () { $(".answer.card_type").resetActives() });
			var cardEle = stripeModal.find("#card-element");
			// if (cardEle.length > 0) {
			// 	attachStripe();
			// }
			stripeModal.data('hasStripeModalFx', true);
		},
		lineItems: function () {
			let lines = $(".lineItem").not('.header');
			log({ lines }, 'initialize line items');
			init(lines, function () {
				$(this).find('.discount, .tax').find('.answer').addClass('input');
				$(this).find('.toggle.save').on('click', function () {
					setTimeout(invoice.lineItems.update, 100);
				})
			});
			system.initialize.editables();
			invoice.lineItems.update();
		},
		pinnedNotes: function () {
			log({ form: $("#AddNote") });
			initAlt('#AddNote', 'hasNoteFx', function () {
				log({ this: this }, 'note initialize');
				minifyForm($(this));
				notes.initialize.withModel(chartnote, autosave.trigger);
			});
		},
		autosave: function () {
			autosave.reset();
			autosave.initialize({
				saveBtn: $("#SaveInvoiceBtn"),
				ajaxCall: invoice.autosave,
				callback: function (data) {
					log({ data }, 'callback data');
					if (data.uid) invoice.current.uid = data.uid;
					log(invoice.current, 'current invoice');
				},
				delay: 10000
			});
		},
		stripe: function () {
			if ($("#card-element").dne()) return;
			var stripeCardStyle = { base: { fontSize: '18px' } };
			invoice.payments.stripe.api = Stripe('pk_test_kmcewhdhAU5eVmRdauVQm76y00eDfxXBUG');
			invoice.payments.stripe.elements = invoice.payments.stripe.api.elements();
			invoice.payments.stripe.card = invoice.payments.stripe.elements.create("card", { style: stripeCardStyle });

			var form = document.getElementById('payment-form'), card = invoice.payments.stripe.card;
			card.mount("#card-element");
			card.addEventListener('change', ({ error }) => {
				const displayError = document.getElementById('card-errors');
				if (error) {
					displayError.textContent = error.message;
				} else {
					displayError.textContent = '';
				}
			});
			var submitBtn = filterByData($("#submit-stripe"), 'hasStripeFx', false);
			submitBtn.on('click', function (ev) {
				// var intent = $("#StripePaymentDetails").data('paymentIntent');
				// var intent = invoice.payments.stripe.intent;
				// blurTopMost("#loading");
				// invoice.payments.stripe.api.confirmCardPayment(intent.client_secret, {
				//     payment_method: {
				//       	card: card,
				//       	billing_details: {
				//         	name: $("#PatientName").text()
				//       	},
				//       	metadata: {
				//       		userid: intent.user_id,
				//       		stripeid: intent.stripe_id
				//       	}
				//     }
				// }).then(function(result) {
				//     if (result.error) {
				// 	    // Show error to your customer (e.g., insufficient funds)
				// 	    feedback('Error Charging Card',result.error.message);
				//     } else {
				//         if (result.paymentIntent.status === 'succeeded') {
				// 	        // Set up a webhook or plugin to listen for the
				// 	        // payment_intent.succeeded event that handles any business critical
				// 	        // post-payment actions.
				// 			var paymentDetails = {
				// 	        	payment_intent_id: result.paymentIntent.id,
				// 	        	payment_method: result.paymentIntent.payment_method,
				// 	        	status: result.paymentIntent.status
				// 	        };
				// 	        invoice.payments.add();
				// 	        var payment = $(".partialPayment").last(), info = payment.data(), details = info.details;
				// 	        $.extend(details,paymentDetails);
				// 	        info.details = details;
				// 	        payment.data(info);
				// 	        // console.log(payment,info,details,paymentDetails,info,payment.data());
				// 			blurTopMost("#checkmark",400,unblurAll);
				//         }
				//     }
				// });
				invoice.payments.stripe.submitPayment();
			});
			submitBtn.data('hasStripeFx', true);

		}
	}
}
