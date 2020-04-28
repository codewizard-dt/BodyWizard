var currencyMap = {
	dollars: "$"
}, currencyLabels = ['$','dollars'];
var stripe = null, elements = null, card = null, currency;
var invoice = {
	current: {
		id: null,
		line_items: null,
		notes: null,
		payments: null,
		appointment_id: null,
		total_charge: null
	},
	autosaveXHR: null,
	payments: {
		add: function(payment = null){
			var form = $("#AddPayment"), obj;

			if (payment && payment.currency != undefined){
				paymentObj = payment;
			}else{
				obj = forms.retrieve(form);
				if (!obj) return false;
				paymentObj = invoice.payments.create();
			}

			var payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), total = $("#TotalCharge").data('value'), remainder = total, amountInput = form.find('.amount'), t = paymentObj.payment_method, cardType = (t == 'card') ? paymentObj.details.card_type : null;
			if (paymentCount == 0){
				$('<div class="label">Payments</div><div class="value" id="PartialPayments"><div id="Remainder" class="little pink"></div></div>').insertAfter("#TotalCharge");
			}
			var title = (cardType ? cardType : "") + " " + t, 
				amountText = paymentObj.currency.symbol+paymentObj.amount,
				newEleHtml = '<div>'+toTitleCase(title) + " - " + amountText + '</div>';
			if (cardType){
				newEleHtml += '<div class="cardOptions flexbox"><span class="checkmark">✓</span></div>';
			}else{
				newEleHtml += '<div class="removePayment flexbox"><span>x</span></div>';
			}
			$("<div/>",{
				class: 'partialPayment flexbox leftSided',
				html: newEleHtml,
				data: paymentObj
			}).insertBefore("#Remainder").on('click','.removePayment',invoice.payments.remove);

			resetForm(form);
			invoice.payments.resetMaxPaymentAmount();
			invoice.current.payments = invoice.payments.retrieve();
			autosave.trigger();
			// invoice.autosave();
			// console.log(invoice.current);
		},
		create: function(){
			var form = $("#AddPayment"), obj = {},
				paymentMethod = justResponse(form.find('.payment_method')), amount = justResponse(form.find('.amount')).split(' '),
				amountNum = amount[0], currencySymbol = amount[1];
			obj['payment_method'] = paymentMethod;
			obj['amount'] = amountNum;
			obj['currency'] = currency;
			obj['details'] = {};
			if (paymentMethod == 'check'){
				obj['details']['check_number'] = justResponse(form.find('.check'),false,null,true);
			}else if (paymentMethod == 'card'){
				var cardType = justResponse(form.find('.card_type'),false,null,true);
				obj['details']['card_type'] = cardType;
			}
			return obj;
		},
		remove: function(){
			var payment = $(this).closest('.partialPayment'), total = $("#TotalCharge").data('value');
			payment.remove()
			if ($(".partialPayment").length == 0){
				var list = $("#PartialPayments");
				list.add(list.prev()).remove();
				$("#SaveInvoiceBtn").removeClass('disabled');
			}else{
				$("#SaveInvoiceBtn").addClass('disabled');
				$("#AddPaymentBtn").slideFadeIn();
			}
			invoice.payments.resetMaxPaymentAmount();
			invoice.current.payments = invoice.payments.retrieve();
			autosave.trigger();
			// invoice.autosave();
		},
		retrieve: function(){
			var payments = [];
			$(".partialPayment").each(function(){payments.push($(this).data());});
			return (payments.length != 0) ? payments : null;
		},
		resetMaxPaymentAmount: function(){
			var total = $("#TotalCharge").data('value'), remainder = total, amountInput = $("#AddPayment").find('.amount');
			if (total == undefined) return false;
			$("#AddPayment").find('.payment_method').resetActives();
			$(".partialPayment").each(function(){
				remainder -= $(this).data('amount');
			});
			amountInput.data('max',remainder.toFixed(2));
			amountInput.val(remainder.toFixed(2));
			if (total == remainder) $("#AddPaymentBtn").fadeOut();
			$("#Remainder").data('value',remainder);
			if (remainder < 0.01) {
				$("#AddPaymentLabel").add("#PaymentMethod").slideFadeOut();
				$("#Remainder").html('');
				$("#SaveInvoiceBtn").removeClass('disabled');
			}else{
				$("#AddPaymentLabel").add("#PaymentMethod").slideFadeIn();
				$("#Remainder").html("<span>" + currency.symbol + remainder.toFixed(2) + "</span> remaining");
				if ($("#Remainder").exists()) $("#SaveInvoiceBtn").addClass('disabled');
			}
		},
		updateTotalDue: function(){
			var lineItems = $(".lineItem").not('.header');
			if (lineItems.length == 0) return false;
			var subtotal = 0, currencySymbol = currency.symbol;
			lineItems.each(function(){
				subtotal += $(this).find('.lineTotal').data('value');
			});
			$("#TotalCharge").html(currencySymbol+subtotal.toFixed(2)).data('value',subtotal);
			invoice.current.total_charge = subtotal;
			invoice.payments.resetMaxPaymentAmount();
		},
		updateAmount: function(){
			var total = $("#TotalCharge").data('value'), amount = $("#AddPayment").find('.amount'), current = Number(amount.val()), payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), remainder = $("#AddPayment").find('.amount').data('max');
			if (paymentCount == 0 && current < total){
				addBtn.fadeIn();
				$("#SaveInvoiceBtn").addClass('disabled');
			}else if(paymentCount == 0){
				addBtn.fadeOut();
				$("#SaveInvoiceBtn").removeClass('disabled');
			}			
		},
		stripe: {
			api: null,
			elements: null,
			card: null,
			intent: null,
			openModal: function(){
				autosave.clearTimer();
				var name = $("#PatientName").text(), amount = $("#AddPayment").find('.amount').val();
				$("#StripePaymentDetails").text(name + " - " + currency.symbol + amount);
				blurTopMost("#StripeModal");
				invoice.payments.stripe.getIntent();
				// getPaymentIntent();
				// console.log(this);				
			},
			getIntent: function(){
				var amount = Number($("#AddPayment").find('.amount').val()), invoiceeId = $("#PatientName").data('userid'), stripeAmount = (currency.abbr == 'usd') ? amount*100 : amount, invoiceId = $("#ApptInfo").data('invoiceid');
				data = {
					amount: stripeAmount,
					currency: currency.abbr
				};
				$.ajax({
					url: '/user/'+invoiceeId+'/invoice/'+invoiceId+'/get-payment-intent',
					method: "POST",
					data: {intent_options: data},
					success:function(data){
						console.log(data);
						invoice.payments.stripe.intent = data;
						$("#ApptInfo").data('invoiceid',getUids('Invoice'));
						// $("#StripePaymentDetails").data('paymentIntent',data);
					}
				})
			},
			submitPayment: function(){
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
				}).then(function(result) {
				    if (result.error) {
					    // Show error to your customer (e.g., insufficient funds)
					    feedback('Error Charging Card',result.error.message);
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
					        $.extend(details,paymentDetails);
					        info.details = details;
					        payment.data(info);
					        // console.log(payment,info,details,paymentDetails,info,payment.data());
							blurTopMost("#checkmark",400,unblurAll);
				        }
				    }
				});

			}
		}
	},
	lineItems: {
		update: function(){
			var lineItems = $(".lineItem").not('.header');
			lineItems.each(function(l,lineItem){
				var price = $(lineItem).find('.price').data('value'), 
					discount = $(lineItem).find('.discount').find('.value').text(),
					currencySymbol = currency.symbol,
					subtotal = Number(price);
				if (discount.includes('%')){
					discount = Number(discount.replace('-','').replace('%','')) / 100;
					subtotal -= price*discount;
				}else if (discount.includes(currencySymbol)){
					discount = Number(discount.replace('-','').replace(currencySymbol,''));
					subtotal -= discount;			
				}
				var tax = ($(lineItem).find('.tax').length == 0) ? 0 : $(lineItem).find('.tax').find('.value').text();
				if (tax.includes('%')){
					tax = Number(tax.replace('%','')) / 100;
					subtotal += subtotal*tax;
				}
				$(lineItem).find('.lineTotal').html(currencySymbol + subtotal.toFixed(2)).data('value',Number(subtotal));
			});
			invoice.payments.updateTotalDue();
			invoice.current.line_items = invoice.lineItems.retrieve();
			autosave.trigger();
			// invoice.autosave();			
		},
		retrieve: function(){
			var lineItems = $(".lineItem").not('.header'), lines = [];
			lineItems.each(function(){
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
			return (lines.length != 0) ? lines : null;
		}
	},
	summary: function(){
		var summary = $('<div/>',{
			html: "<div class='split50KeyValues list'></div>"
		}), lineItems = "", payments = "", hasCard = false;
		$.each(invoice.current.payments,function(x,p){
			console.log(p);
			if (p.payment_method == 'card') hasCard = true;
			if (hasCard){
				payments += "<div>"+p.currency.symbol+Number(p.amount).toFixed(2)+" - "+toTitleCase(p.details.card_type + " " + p.payment_method)+"</div>";
			}else{
				payments += "<div>"+p.currency.symbol+Number(p.amount).toFixed(2)+" - "+toTitleCase(p.payment_method)+"</div>";
			}
		})
		var prompt = "Save Invoice?";
		summary.find('.list').appendKeyValuePair('Patient',$("#PatientName").text());
		summary.find('.list').appendKeyValuePair('Payments',payments);
		summary.find('.list').appendKeyValuePair('Total Charge',"<span class='pink'>"+$('#TotalCharge').text()+"</span>");
		summary.append($('<h3 class="pink">'+prompt+'</h3>'));
		return summary;
	},
	autosave: function(){
		invoice.autosaveXHR = $.ajax({
			url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/autosave',
			method: 'POST',
			data: invoice.current,
			success:function(data){
				$("#ApptInfo").data('invoiceid',getUids('Invoice'));
				invoice.autosaveXHR = null;
				autosave.success();
			}
		})
	},
	save: {
		openModal: function(){
			if ($(this).hasClass('disabled')) return false;
			// var invoiceObj = createInvoiceObj();
			// if (!invoiceObj) return false;
			confirm(
				'Confirm Payment Summary',
				'<div id="InvoiceSummary"></div>',
				'yes, do it', 'cancel',
				null,function(){
					setTimeout(function(){
						invoice.save.confirm();
					},250)
				}
			);
			$("#InvoiceSummary").replaceWith(invoice.summary);
		},
		confirm: function(){
			blurTopMost('#loading');
			console.log(invoice.current);
			$.ajax({
				url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/save',
				method: 'POST',
				data: invoice.current,
				success:function(data){
					console.log(data);
					blurTopMost("#checkmark",400,function(){
						delayedUnblurAll();
						clickTab("#invoice-index");
					});
				}
			})
		}
	},
	view: {
		modal: function(uid){
			blurTopMost("#loading");
			$.ajax({
				url:'/Invoice/'+uid+'/view',
				method: "GET",
				success: function(data){
					// console.log('"viewNote" load');
					if ($("#Invoice").exists()){
						$("#Invoice").html(data).attr('class', 'modalForm signed');
					}else{
						$("<div/>",{id:"Invoice",class:'modalForm signed',html:data}).appendTo('body');
					}
					blurTopMost('#Invoice');
					// initializeNewForms();
					// initializeChartNotePage();
					// invoice.initialize.all();
				}
			})	
		},		
		optionsNavClick: function(){invoice.view.modal($("#CurrentInvoice").data('uid'));},
		// apptInfoClick: function(){invoice.view.modal($)}
	},
	autofill: {
		onload: function(){
			var info = $("#ApptInfo").data('autosave');
			if (info == '""' || info == undefined || $("#Invoice").length == 0) return false;
			notes.autofill(info.notes);
			invoice.autofill.lineItems(info.line_items);
			if (info.payments) invoice.autofill.payments(info.payments);
			if ($("#Remainder").exists()) $("#AddPaymentBtn").slideFadeIn();
			// else $("#SaveInvoiceBtn").removeClass('disabled');
			setTimeout(autosave.clearTimer,400);
		},
		lineItems: function(autosavedLines){
			var lineItemProxy = $(".lineItem").not('.header').first().clone();
			$(".lineItem").not('.header').remove();
			$.each(autosavedLines,function(n, lineItem){
				var section = lineItem.type, last = $(".lineItem").filter("[data-type='"+section+"']").last(), newLineItem = lineItemProxy.clone();
				newLineItem.insertAfter(last).data(lineItem.data);
				newLineItem.find('.description').find('.value').text(lineItem.description);
				newLineItem.find('.price').text(currency.symbol+lineItem.price);
				newLineItem.find('.price').data('value',lineItem.price);
				newLineItem.find('.discount').find('.value').text(lineItem.discount);
				newLineItem.find('.Discount').val(lineItem.discount);
				newLineItem.find('.tax').find('.value').text(lineItem.tax);
				newLineItem.find('.Tax').val(lineItem.tax);
			});
			// initializeLineItems();
			invoice.lineItems.update();
		},
		notes: function(){},
		payments: function(autosavedPayments){
			$.each(autosavedPayments,function(p, payment){
				invoice.payments.add(payment);
			});
		},
	},
	initialize: {
		all: function(){
			if ($("#Invoice").dne()) return;
			notes.resetForm();
			currency = $("#PaymentDetails").data('currency');
			$.each(invoice.initialize, function(name, initFunc){
				if (name != 'all' && typeof initFunc === 'function') initFunc();
			});
			invoice.autofill.onload();
			if (!$("#CurrentAppt").exists()) $(".selectNewAppt").click();
			else invoice.current.appointment_id = $("#CurrentAppt").data('uid');
		},
		selectNewApptBtns: function(fadeTheseIn = "#ApptsWithoutInvoices"){
		    var selectBtn = filterUninitialized('.selectNewAppt');
		    selectBtn.on('click',function(){
		        showOtherAppts(fadeTheseIn);
		    });
		    selectBtn.data('initialized',true);			
		},
		confirmApptBtn: function(){
			var btn = filterUninitialized($('#ConfirmApptForInvoice').find('.confirmApptBtn'));
			btn.on('click',function(){
				if ($(this).hasClass('disabled')) {
					confirm('No Appointment Selected',
						'Either select an appointment or proceed to create an invoice unattached to any appointment.<h3 class="pink">Create Invoice Without Appointment?</h3>',
						'yes create invoice', 'no, go back',
						null, function(){alert('figure this out lolol')});
					return false;
				}
				var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
				$("#ConfirmApptForInvoice").slideFadeOut();
				LoadingContent("#Invoice","/appointment/"+apptId+"/edit-invoice");
			});
			btn.data('initialized',true);
		},
		apptClick: function(){
		    var appts = filterUninitialized('.appt');
		    if (appts.dne()) return;
		    appts.on('click',selectThisAppt);
		    appts.data('initialized');
		},
		noApptsBtn: function(message = 'All of your chart notes from the last 30 days are already signed.'){
		    var btn = filterUninitialized("#NoEligibleApptsBtn");
		    btn.on('click',function(){
		        confirm('No Eligible Appointments',message,'create new appointment','dismiss',null,function(){clickTab("appointments-index");unblurAll();})
		    });
		    btn.data('initalized',true);			
		},		
		payments: function(){
			minifyForm("#AddPayment");
			var amountInput = filterByData($("#AddPayment").find('.number'),'hasInvoiceFx',false);
			amountInput.each(function(){
				var input = $(this).find('input'), label = $(this).find('.label'), newLabelText = currencyMap[label.text()], total = $("#TotalCharge").data('value');
				input.val(total);
				input.data('max',total);
				label.insertBefore(input).text(newLabelText);
				$(this).on('touchend mouseup','.change',function(){
					setTimeout(invoice.payments.updateAmount,500);
				});
				$(this).on('focusout','input',function(){
					setTimeout(invoice.payments.updateAmount,500);
				});
				$("<div/>",{
					class: 'button xsmall pink',
					id: 'AddPaymentBtn',
					text: 'add payment',
					css: {margin:'0.5em 0.5em 0.5em 1.5em'}
				}).appendTo($(this)).hide().on('click',invoice.payments.add);
			});
			amountInput.data('hasInvoiceFx',true);
			var stripeBtn = filterByData($('li').filter("[data-value='Stripe']"),'hasStripeModalFx',false);
			stripeBtn.on('click',invoice.payments.stripe.openModal);
			stripeBtn.data('hasStripeModalFx',true);
			var stripeModal = filterByData($('#StripeModal'),'hasStripeModalFx',false);
			stripeModal.on('click','.cancel',function(){$(".answer.card_type").resetActives()});
			var cardEle = stripeModal.find("#card-element");
			// if (cardEle.length > 0) {
			// 	attachStripe();
			// }
			stripeModal.data('hasStripeModalFx',true);
		},
		lineItems: function(){
			var items = filterUninitialized('.lineItem');
			items.find('.number').each(function(){
				var input = $(this).find('input'), initial = input.data('initial'), label = $(this).find('.label');
				input.val(initial);
				label.insertBefore(input).text(currency.symbol);
				$(this).find('.lineTotal').text(currency.symbol+initial);
				$(this).on('touchend mouseup','.change',function(){
					setTimeout(invoice.lineItems.update,500);
				});
				$(this).on('focusout','input',function(){
					setTimeout(invoice.lineItems.update,500);
				});
			})
			items.find('.discount, .tax').find('.answer').addClass('input');
			items.find('.toggle.save').on('click',function(){
				setTimeout(invoice.lineItems.update,100);
			});
			items.data('initialized',true);
			invoice.lineItems.update();			
		},
		pinnedNotes: function(){
			var noteForm = filterByData($("#AddNote"),'hasNoteFx',false);
			if (noteForm.dne()) return;
			minifyForm(noteForm);
			notes.initialize.withModel(invoice, autosave.trigger);
			noteForm.data('hasNoteFx',true);
		},
		saveBtn: function(){
			var btn = filterByData('#SaveInvoiceBtn','hasSaveFx',false);
			btn.on('click',function(){
				if ($(this).hasClass('disabled')) return false;
				confirm(
					'Confirm Payment Summary',
					'<div id="InvoiceSummary"></div>',
					'yes, do it', 'cancel',
					null,function(){
						setTimeout(function(){
							invoice.save.confirm();
						},250)
					}
				);
				$("#InvoiceSummary").replaceWith(invoice.summary());
			});
			btn.data('hasSaveFx',true);			
		},
		autosave: function(){
			autosave.reset();
			autosave.initialize({
		        saveBtn: $("#SaveInvoiceBtn"),
		        ajaxCall: invoice.autosave,
		        callback: null,
		        delay: 10000
			});
		},
		stripe: function(){
			if ($("#card-element").dne()) return;
			var stripeCardStyle = {base : {fontSize: '18px'}};
			invoice.payments.stripe.api = Stripe('pk_test_kmcewhdhAU5eVmRdauVQm76y00eDfxXBUG');
			invoice.payments.stripe.elements = invoice.payments.stripe.api.elements();
			invoice.payments.stripe.card = invoice.payments.stripe.elements.create("card",{style:stripeCardStyle});			

			var form = document.getElementById('payment-form'), card = invoice.payments.stripe.card;
			card.mount("#card-element");
			card.addEventListener('change', ({error}) => {
				const displayError = document.getElementById('card-errors');
				if (error) {
				    displayError.textContent = error.message;
				} else {
				    displayError.textContent = '';
				}
			});
			var submitBtn = filterByData($("#submit-stripe"),'hasStripeFx',false);
			submitBtn.on('click',function(ev){
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
			submitBtn.data('hasStripeFx',true);

		}
	}
}
// function initializeInvoicePage(){
// 	console.log('use invoice.initalize.all');
// 	return;
// 	if ($("#Invoice").dne()) return;
// 	notes.resetForm();
// 	currency = $("#PaymentDetails").data('currency');
// 	initializeSelectNewApptBtns("#ApptsWithoutInvoices");
// 	initializeConfirmApptForInvoiceBtn();
// 	initializeApptClicks();
// 	initializeLineItems();
// 	initializePayments();
// 	initializeSaveInvoiceBtn();
// 	initializeAdditionalNoteForm(invoice, invoice.autosave);
// 	minifyForm($("#AddNote"));
// 	// invoice.autofill.onload();
// 	clearTimeout(autosaveInvoiceTimer);
// 	setTimeout(function(){
// 		clearTimeout(autosaveInvoiceTimer);
// 	},3000);
// 	if (!$("#CurrentAppt").exists()) $(".selectNewAppt").click();
// 	else invoice.current.appointment_id = $("#CurrentAppt").data('uid');
// }
// function initializeConfirmApptForInvoiceBtn(){
// 	var btn = filterUninitialized($('#ConfirmApptForInvoice').find('.confirmApptBtn'));
// 	btn.on('click',confirmApptForInvoice);
// 	btn.data('initialized',true);	
// }
// function initializeLineItems(){
// 	var items = filterUninitialized('.lineItem');
// 	items.find('.number').each(function(){
// 		var input = $(this).find('input'), initial = input.data('initial'), label = $(this).find('.label');
// 		input.val(initial);
// 		label.insertBefore(input).text(currency.symbol);
// 		$(this).find('.lineTotal').text(currency.symbol+initial);
// 		$(this).on('touchend mouseup','.change',function(){
// 			setTimeout(invoice.lineItems.update,500);
// 		});
// 		$(this).on('focusout','input',function(){
// 			setTimeout(invoice.lineItems.update,500);
// 		});
// 	})
// 	items.find('.discount, .tax').find('.answer').addClass('input');
// 	items.find('.toggle.save').on('click',function(){
// 		setTimeout(invoice.lineItems.update,100);
// 	});
// 	items.data('initialized',true);
// 	invoice.lineItems.update();
// }
// function initializePayments(){
// 	var stripeCardStyle = {base : {fontSize: '18px'}};
// 	if (!stripe) stripe = Stripe('pk_test_kmcewhdhAU5eVmRdauVQm76y00eDfxXBUG');
// 	if (!elements) elements = stripe.elements();
// 	if (!card) card = elements.create("card",{style:stripeCardStyle});

// 	minifyForm($("#AddPayment"));
// 	var amountInput = filterByData($("#AddPayment").find('.number'),'hasInvoiceFx',false);
// 	amountInput.each(function(){
// 		var input = $(this).find('input'), label = $(this).find('.label'), newLabelText = currencyMap[label.text()], total = $("#TotalCharge").data('value');
// 		input.val(total);
// 		input.data('max',total);
// 		label.insertBefore(input).text(newLabelText);
// 		$(this).on('touchend mouseup','.change',function(){
// 			setTimeout(updatePaymentAmount,500);
// 		});
// 		$(this).on('focusout','input',function(){
// 			setTimeout(updatePaymentAmount,500);
// 		});
// 		$("<div/>",{
// 			class: 'button xsmall pink',
// 			id: 'AddPaymentBtn',
// 			text: 'add payment',
// 			css: {margin:'0.5em 0.5em 0.5em 1.5em'}
// 		}).appendTo($(this)).hide().on('click',invoice.payments.add);
// 	});
// 	amountInput.data('hasInvoiceFx',true);
// 	var stripeBtn = filterByData($('li').filter("[data-value='Stripe']"),'hasStripeModalFx',false);
// 	stripeBtn.on('click',openStripeModal);
// 	stripeBtn.data('hasStripeModalFx',true);
// 	var stripeModal = filterByData($('#StripeModal'),'hasStripeModalFx',false);
// 	stripeModal.on('click','.cancel',function(){$(".answer.card_type").resetActives()});
// 	var cardEle = stripeModal.find("#card-element");
// 	if (cardEle.length > 0) {
// 		attachStripe();
// 	}
// 	stripeModal.data('hasStripeModalFx',true);
// }
// function initializeSaveInvoiceBtn(){
// 	var btn = filterByData('#SaveInvoiceBtn','hasSaveFx',false);
// 	btn.on('click',openSaveInvoiceModal);
// 	btn.data('hasSaveFx',true);
// }
// var autosaveInvoiceTimer = null, autosaveInvoiceXHR = null;


// function attachStripe(){
// 	console.log('use invoice.initialize.stripe');
// 	return;
// 	var form = document.getElementById('payment-form');
// 	card.mount("#card-element");
// 	card.addEventListener('change', ({error}) => {
// 		const displayError = document.getElementById('card-errors');
// 		if (error) {
// 		    displayError.textContent = error.message;
// 		} else {
// 		    displayError.textContent = '';
// 		}
// 	});
// 	var submitBtn = filterByData($("#submit-stripe"),'hasStripeFx',false);
// 	submitBtn.on('click',function(ev){
// 		var intent = $("#StripePaymentDetails").data('paymentIntent');
// 		blurTopMost("#loading");
// 		ev.preventDefault();
// 		stripe.confirmCardPayment(intent.client_secret, {
// 		    payment_method: {
// 		      	card: card,
// 		      	billing_details: {
// 		        	name: $("#PatientName").text()
// 		      	},
// 		      	metadata: {
// 		      		userid: intent.user_id,
// 		      		stripeid: intent.stripe_id
// 		      	}
// 		    }
// 		}).then(function(result) {
// 		    if (result.error) {
// 			    // Show error to your customer (e.g., insufficient funds)
// 			    feedback('Error Charging Card',result.error.message);
// 		    } else {
// 		        if (result.paymentIntent.status === 'succeeded') {
// 			        // Set up a webhook or plugin to listen for the
// 			        // payment_intent.succeeded event that handles any business critical
// 			        // post-payment actions.
// 					var paymentDetails = {
// 			        	payment_intent_id: result.paymentIntent.id,
// 			        	payment_method: result.paymentIntent.payment_method,
// 			        	status: result.paymentIntent.status
// 			        };
// 			        invoice.payments.add();
// 			        var payment = $(".partialPayment").last(), info = payment.data(), details = info.details;
// 			        $.extend(details,paymentDetails);
// 			        info.details = details;
// 			        payment.data(info);
// 			        // console.log(payment,info,details,paymentDetails,info,payment.data());
// 					blurTopMost("#checkmark",400,unblurAll);
// 		        }
// 		    }
// 		});
// 	});
// 	submitBtn.data('hasStripeFx',true);
// }

// $.fn.fillLineItem = function (lineItemObj){
// 	var symbol = currency.symbol;
// 	this.find('.description').find('.value').text(lineItemObj.description);
// 	this.find('.price').text(currency.symbol+lineItemObj.price);
// 	this.find('.price').data('value',lineItemObj.price);
// 	this.find('.discount').find('.value').text(lineItemObj.discount);
// 	this.find('.Discount').val(lineItemObj.discount);
// 	this.find('.tax').find('.value').text(lineItemObj.tax);
// 	this.find('.Tax').val(lineItemObj.tax);
// }

// function openSaveInvoiceModal(){
// 	console.log('use invoice.openSaveModal');
// 	return;
// 	if ($(this).hasClass('disabled')) return false;

// 	var invoiceObj = createInvoiceObj();
// 	if (!invoiceObj) return false;
// 	confirm(
// 		'Confirm Payment Summary',
// 		'<div id="InvoiceSummary"></div>',
// 		'yes, do it', 'cancel',
// 		null,function(){
// 			setTimeout(function(){
// 				saveInvoice(invoiceObj);
// 			},250)
// 		}
// 	);
// 	$("#InvoiceSummary").replaceWith(invoiceSummary(invoiceObj));
// }
// function invoiceSummary(invoiceObj){
// 	console.log('use invoice.summary');
// 	return;
// 	var summary = $('<div/>',{
// 		html: "<div class='split50KeyValues list'></div>"
// 	}), lineItems = "", payments = "", hasCard = false;
// 	$.each(invoiceObj.payments,function(x,p){
// 		console.log(p);
// 		if (p.payment_method == 'card') hasCard = true;
// 		payments += "<div>"+p.currency.symbol+Number(p.amount).toFixed(2)+" - "+toTitleCase(p.payment_method)+"</div>";
// 	})
// 	var prompt = "Save Invoice?";
// 	summary.find('.list').appendKeyValuePair('Patient',$("#PatientName").text());
// 	summary.find('.list').appendKeyValuePair('Payments',payments);
// 	summary.find('.list').appendKeyValuePair('Total Charge',"<span class='pink'>"+$('#TotalCharge').text()+"</span>");
// 	summary.append($('<h3 class="pink">'+prompt+'</h3>'));
// 	return summary;
// }
// function createInvoiceObj(autosave = false){
// 	console.log('invoice.current');
// 	return;

// 	var partialPayments = $('.partialPayment'), hasSinglePayment = (partialPayments.length == 0), payments = [], paymentForm = $("#AddPayment");
// 	if (!autosave){
// 		if (hasSinglePayment){
// 			if (!forms.retrieve(paymentForm)) return false;
// 			payments.push(createPaymentObj());
// 		}else if (!$("#AddPaymentLabel").is(":visible")){
// 			partialPayments.each(function(){
// 				payments.push($(this).data());
// 			})
// 		}else{
// 			$("#AddPaymentBtn").click();
// 			return false;
// 		}		
// 	}else{
// 		partialPayments.each(function(){
// 			payments.push($(this).data());
// 			// console.log($(this).data());
// 		})
// 	}

// 	var lineItems = createLineItemObj(), notes = [];
// 	$("#NoteList").find(".note").each(function(){
// 		notes.push($(this).data());
// 	})
// 	var invoiceObj = {
// 		appointment_id: $("#CurrentAppt").data('uid'),
// 		line_items: (lineItems.length == 0) ? null : lineItems,
// 		total_charge: $("#TotalCharge").data('value'),
// 		payments: (payments.length == 0) ? null : payments,
// 		notes: (notes.length == 0) ? null : notes
// 	};
// 	// console.log(invoiceObj)
// 	return invoiceObj;
// }

// function autoSaveInvoice(){
// 	// if (autosaveInvoiceTimer){
// 	// 	clearTimeout(autosaveInvoiceTimer);
// 	// }
// 	// autosaveInvoiceTimer = setTimeout(function(){
// 	// 	// console.log('autosave trigger');
// 	// 	var postObj = createInvoiceObj(true);
// 	// 	if (postObj.line_items == null) return;
// 	// 	console.log(postObj);
// 	// 	autosaveInvoiceXHR = $.ajax({
// 	// 		url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/autosave',
// 	// 		method: 'POST',
// 	// 		data: createInvoiceObj(true),
// 	// 		success:function(data){
// 	// 			$("#ApptInfo").data('invoiceid',getUids('Invoice'));
// 	// 			showAutosaveTime();
// 	// 			autosaveInvoiceXHR = null;
// 	// 			// console.log(data);
// 	// 		}
// 	// 	})
// 	// },4000);
// }
// function saveInvoice(invoiceObj){
// 	console.log('use invoice.save');
// 	return;
// 	blurTopMost('#loading');
// 	// console.log('sending invoice obj:',invoiceObj);
// 	if (autosaveInvoiceXHR) {
// 		// console.log(autosaveInvoiceXHR);
// 		setTimeout(function(){
// 			saveInvoice(invoiceObj);
// 		},300);
// 		return false;
// 	}
// 	// console.log('sending invoice obj:',invoiceObj);
// 	$.ajax({
// 		url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/save',
// 		method: 'POST',
// 		data: invoiceObj,
// 		success:function(data){
// 			console.log(data);
// 			blurTopMost("#checkmark",400,function(){
// 				delayedUnblurAll();
// 				clickTab("#invoice-index");
// 			});
// 		}
// 	})
// }

// function createLineItemObj(){
// 	var lineItems = $(".lineItem").not('.header'), lines = [];
// 	lineItems.each(function(){
// 		var data = $(this).data();
// 		delete data.initialized;
// 		lines.push({
// 			description: $(this).find(".description").find('.value').text(),
// 			price: $(this).find(".price").data('value'),
// 			discount: $(this).find(".discount").find('.value').text(),
// 			tax: $(this).find(".tax").find('.value').text(),
// 			subtotal: $(this).find(".lineTotal").data('value'),
// 			type: $(this).siblings('.header').data('type'),
// 			data: data
// 		})
// 	});
// 	return lines;
// }
// function updateLineItems(){
	// var lineItems = $(".lineItem").not('.header');
	// lineItems.each(function(){
	// 	var price = $(this).find('.price').data('value'), 
	// 		discount = $(this).find('.discount').find('.value').text(),
	// 		currencySymbol = currency.symbol,
	// 		subtotal = Number(price);
	// 	if (discount.includes('%')){
	// 		discount = Number(discount.replace('-','').replace('%','')) / 100;
	// 		subtotal -= price*discount;
	// 	}else if (discount.includes(currencySymbol)){
	// 		discount = Number(discount.replace('-','').replace(currencySymbol,''));
	// 		subtotal -= discount;			
	// 	}
	// 	var tax = ($(this).find('.tax').length == 0) ? 0 : $(this).find('.tax').find('.value').text();
	// 	if (tax.includes('%')){
	// 		tax = Number(tax.replace('%','')) / 100;
	// 		subtotal += subtotal*tax;
	// 	}
	// 	$(this).find('.lineTotal').html(currencySymbol + subtotal.toFixed(2)).data('value',Number(subtotal));
	// });
	// updateTotal();
	// autoSaveInvoice();
	// console.log('should have autosaved');
// }
// function updatePaymentAmount(){
// 	console.log('use payment.updateAmount');
// 	return;
// 	var total = $("#TotalCharge").data('value'), amount = $("#AddPayment").find('.amount'), current = Number(amount.val()), payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), remainder = $("#AddPayment").find('.amount').data('max');
// 	if (paymentCount == 0 && current < total){
// 		addBtn.fadeIn();
// 		$("#SaveInvoiceBtn").addClass('disabled');
// 	}else if(paymentCount == 0){
// 		addBtn.fadeOut();
// 		$("#SaveInvoiceBtn").removeClass('disabled');
// 	}
// }
// function addPayment(){
// 	var form = $("#AddPayment"),  obj = forms.retrieve(form);
// 	if (!obj) return false;
// 	console.log('use invoice.addPayment');
// 	// var paymentObj = createPaymentObj();
// 	// var payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), total = $("#TotalCharge").data('value'), remainder = total, amountInput = form.find('.amount'), t = paymentObj.payment_method, cardType = (t == 'card') ? paymentObj.details.card_type : null;
// 	// if (paymentCount == 0){
// 	// 	$('<div class="label">Payments</div><div class="value" id="PartialPayments"><div id="Remainder" class="little pink"></div></div>').insertAfter("#TotalCharge");
// 	// }
// 	// var title = (cardType ? cardType : "") + " " + t, 
// 	// 	amountText = paymentObj.currency.symbol+paymentObj.amount,
// 	// 	newEleHtml = '<div>'+toTitleCase(title) + " - " + amountText + '</div>';
// 	// if (cardType){
// 	// 	newEleHtml += '<div class="cardOptions flexbox"><span class="checkmark">✓</span></div>';
// 	// }else{
// 	// 	newEleHtml += '<div class="removePayment flexbox"><span>x</span></div>';
// 	// }
// 	// $("<div/>",{
// 	// 	class: 'partialPayment flexbox leftSided',
// 	// 	html: newEleHtml,
// 	// 	data: paymentObj
// 	// }).insertBefore("#Remainder").on('click','.removePayment',removePayment);

// 	// resetForm(form);
// 	// resetMaxPaymentAmount();
// 	// autoSaveInvoice();
// }
// function resetMaxPaymentAmount(){
// 	var total = $("#TotalCharge").data('value'), remainder = total, amountInput = $("#AddPayment").find('.amount');
// 	if (total == undefined) return false;
// 	$("#AddPayment").find('.payment_method').resetActives();
// 	$(".partialPayment").each(function(){
// 		remainder -= $(this).data('amount');
// 	});
// 	amountInput.data('max',remainder.toFixed(2));
// 	amountInput.val(remainder.toFixed(2));
// 	if (total == remainder) $("#AddPaymentBtn").fadeOut();
// 	$("#Remainder").data('value',remainder);
// 	if (remainder < 0.01) {
// 		$("#AddPaymentLabel").add("#PaymentMethod").slideFadeOut();
// 		$("#Remainder").html('');
// 		$("#SaveInvoiceBtn").removeClass('disabled');
// 	}else{
// 		$("#AddPaymentLabel").add("#PaymentMethod").slideFadeIn();
// 		$("#Remainder").html("<span>" + currency.symbol + remainder.toFixed(2) + "</span> remaining");
// 	}
// }
// function removePayment(){
// 	console.log('hi');
// }
// function createPaymentObj(){
// 	var form = $("#AddPayment"), obj = {},
// 		paymentMethod = justResponse(form.find('.payment_method')), amount = justResponse(form.find('.amount')).split(' '),
// 		amountNum = amount[0], currencySymbol = amount[1];
// 	// console.log(amount);
// 	obj['payment_method'] = paymentMethod;
// 	obj['amount'] = amountNum;
// 	obj['currency'] = currency;
// 	obj['details'] = {};
// 	if (paymentMethod == 'check'){
// 		obj['details']['check_number'] = justResponse(form.find('.check'),false,null,true);
// 	}else if (paymentMethod == 'card'){
// 		var cardType = justResponse(form.find('.card_type'),false,null,true);
// 		obj['details']['card_type'] = cardType;
// 	}
// 	return obj;
// }
// function updateTotal(){
// 	// var lineItems = $(".lineItem").not('.header');
// 	// if (lineItems.length == 0) return false;
// 	// var subtotal = 0, currencySymbol = currency.symbol;
// 	// lineItems.each(function(){
// 	// 	subtotal += $(this).find('.lineTotal').data('value');
// 	// });
// 	// $("#TotalCharge").html(currencySymbol+subtotal.toFixed(2)).data('value',subtotal);
// 	// invoice.resetMaxPaymentAmount();
// }
// function openStripeModal(){
// 	console.log('use invoice.payments.stripe.openmodal');
// 	return;
// 	clearTimeout(autosaveInvoiceTimer);
// 	var name = $("#PatientName").text(), amount = $("#AddPayment").find('.amount').val();
// 	$("#StripePaymentDetails").text(name + " - " + currency.symbol + amount);
// 	blurTopMost("#StripeModal");
// 	getPaymentIntent();
// }
// function getPaymentIntent(){
// 	var amount = Number($("#AddPayment").find('.amount').val()), invoiceeId = $("#PatientName").data('userid'), stripeAmount = (currency.abbr == 'usd') ? amount*100 : amount;
// 		data = {
// 			amount: stripeAmount,
// 			currency: currency.abbr
// 		};
// 		$.ajax({
// 			url: '/user/'+invoiceeId+'/get-payment-intent',
// 			method: "POST",
// 			data: {intent_options: data},
// 			success:function(data){
// 				console.log(data);
// 				$("#StripePaymentDetails").data('paymentIntent',data);
// 			}
// 		})
// }
// function confirmApptForInvoice(){
// 	if ($(this).hasClass('disabled')) {
// 		confirm('No Appointment Selected','Either select an appointment or proceed to create an invoice unattached to any appointment.<h3 class="pink">Create Invoice Without Appointment?</h3>','yes create invoice','no, go back',null,createAppointmentIndependentInvoice);
// 		return false;
// 	}
// 	var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
// 	$("#ConfirmApptForInvoice").slideFadeOut();
// 	// LoadingContent("#Invoice","/appointment/"+apptId+"/edit-invoice",updateLineItemList);
// 	LoadingContent("#Invoice","/appointment/"+apptId+"/edit-invoice");
// }
// function createAppointmentIndependentInvoice(){
// 	alert('yes hi');
// }
// function updateLineItemList(){
// 	// console.log('line items');
// }