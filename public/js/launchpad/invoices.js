var currencyMap = {
	dollars: "$"
}, currencyLabels = ['$','dollars'];
var stripe = null, elements = null, card = null, currency;

function initializeInvoicePage(){
	currency = $("#PaymentDetails").data('currency');
	initializeConfirmApptForInvoiceBtn();
	initializeLineItems();
	initializePayments();
	initializeSaveInvoiceBtn();
	initializeAdditionalNoteForm();
	// initializeInvoiceAutoSave();
	minifyForm($("#AddNote"));
	invoiceAutosaveFill();
	clearTimeout(autosaveInvoiceTimer);
}
function initializeConfirmApptForInvoiceBtn(){
	var btn = filterUninitialized($('#ConfirmApptForInvoice').find('.confirmApptBtn'));
	btn.on('click',confirmApptForInvoice);
	btn.data('initialized',true);	
}
function initializeLineItems(){
	var items = filterUninitialized('.lineItem');
	items.find('.number').each(function(){
		var input = $(this).find('input'), initial = input.data('initial'), label = $(this).find('.label');
		input.val(initial);
		label.insertBefore(input).text(currency.symbol);
		$(this).find('.lineTotal').text(currency.symbol+initial);
		$(this).on('touchend mouseup','.change',function(){
			setTimeout(updateLineItems,500);
		});
		$(this).on('focusout','input',function(){
			setTimeout(updateLineItems,500);
		});
	})
	items.find('.discount, .tax').find('.answer').addClass('input');
	items.find('.toggle.save').on('click',function(){
		setTimeout(updateLineItems,100);
	});
	items.data('initialized',true);
	updateLineItems();
}
function initializePayments(){
	var stripeCardStyle = {base : {fontSize: '16px'}};
	if (!stripe) stripe = Stripe('pk_test_kmcewhdhAU5eVmRdauVQm76y00eDfxXBUG');
	if (!elements) elements = stripe.elements();
	if (!card) card = elements.create("card",{style:stripeCardStyle});

	minifyForm($("#AddPayment"));
	var amount = filterByData($("#AddPayment").find('.number'),'hasInvoiceFx',false);
	amount.each(function(){
		var input = $(this).find('input'), label = $(this).find('.label'), newLabelText = currencyMap[label.text()], total = $("#TotalCharge").data('value');
		input.val(total);
		input.data('max',total);
		label.insertBefore(input).text(newLabelText);
		$(this).on('touchend mouseup','.change',function(){
			setTimeout(updatePaymentAmount,500);
		});
		$(this).on('focusout','input',function(){
			setTimeout(updatePaymentAmount,500);
		});
		$("<div/>",{
			class: 'button xsmall pink',
			id: 'AddPaymentBtn',
			text: 'add payment',
			css: {margin:'0.5em 0.5em 0.5em 1.5em'}
		}).appendTo($(this)).hide().on('click',addPayment);
	});
	amount.data('hasInvoiceFx',true);
	var stripeBtn = filterByData($('li').filter("[data-value='Stripe']"),'hasStripeModalFx',false);
	stripeBtn.on('click',openStripeModal);
	stripeBtn.data('hasStripeModalFx',true);
	var stripeModal = filterByData($('#StripeModal'),'hasStripeModalFx',false);
	stripeModal.on('click','.cancel',function(){$(".answer.card_type").resetActives()});
	var cardEle = stripeModal.find("#card-element");
	if (cardEle.length > 0) {
		attachStripe();
	}
	stripeModal.data('hasStripeModalFx',true);
}
function initializeSaveInvoiceBtn(){
	var btn = filterByData('#SaveInvoiceBtn','hasSaveFx',false);
	btn.on('click',openSaveInvoiceModal);
	btn.data('hasSaveFx',true);
}
var autosaveInvoiceTimer = null, autosaveInvoiceXHR = null;


function attachStripe(){
	var form = document.getElementById('payment-form');
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
	submitBtn.on('click',function(){
		var intent = $("#StripePaymentDetails").data('paymentIntent');
		blurTopMost("#loading");
		ev.preventDefault();
		stripe.confirmCardPayment(intent.client_secret, {
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
			        addPayment();
			        var payment = $(".partialPayment").last(), info = payment.data(), details = info.details;
			        $.extend(details,paymentDetails);
			        info.details = details;
			        payment.data(info);
			        console.log(payment,info,details,paymentDetails,info,payment.data());
					blurTopMost("#checkmark",400,unblurAll);

		        }
		    }
		});
	});
	submitBtn.data('hasStripeFx',true);
}
function submit(){

}

function invoiceAutosaveFill(){
	var info = $("#ApptInfo").data('autosave');
	if (info == '""' || info == undefined || $("#Invoice").length == 0) return false;
	$.each(info.notes,function(n, note){
		$(".note_title").val(note.title);
		$('.note_details').val(note.text);
		addNote();
	});
	lineItemAutosaveFill(info.line_items);
	if (info.payments) paymentAutosaveFill(info.payments);
	if ($("#Remainder").length == 1) $("#AddPaymentBtn").slideFadeIn();

	setTimeout(function(){
		clearTimeout(autosaveInvoiceTimer);
	},400)
}
function paymentAutosaveFill(autosavedPayments){
	$.each(autosavedPayments,function(p, payment){
		console.log(payment);
		var form = $("#AddPayment"), t = payment.payment_method, cardType = (t == 'card' && payment.details != undefined) ? payment.details.card_type : null;
		form.find('li').filter('[data-value="'+t+'"]').click();
		if (cardType){
			form.find('.card_type').find('li').filter('[data-value="'+cardType+'"]').addClass('active');
		}
		form.find('.amount').val(payment.amount);
		$("#AddPaymentBtn").click();
	})
}
function lineItemAutosaveFill(autosavedLines){
	var lineItemProxy = $(".lineItem").not('.header').first().clone();
	$(".lineItem").not('.header').remove();
	$.each(autosavedLines,function(n, lineItem){
		var section = lineItem.type, last = $(".lineItem").filter("[data-type='"+section+"']").last(), newLineItem = lineItemProxy.clone();
		newLineItem.insertAfter(last).data(lineItem.data);
		newLineItem.fillLineItem(lineItem);
	});
	initializeLineItems();
	updateLineItems();
}
$.fn.fillLineItem = function (lineItemObj){
	var symbol = currency.symbol;
	this.find('.description').find('.value').text(lineItemObj.description);
	this.find('.price').text(symbol+lineItemObj.price);
	this.find('.price').data('value',lineItemObj.price);
	this.find('.discount').find('.value').text(lineItemObj.discount);
	this.find('.Discount').val(lineItemObj.discount);
	this.find('.tax').find('.value').text(lineItemObj.tax);
	this.find('.Tax').val(lineItemObj.tax);
}

function openSaveInvoiceModal(){
	if ($(this).hasClass('disabled')){
		// addPayment();
		return false;
	}
	var invoiceObj = createInvoiceObj();
	if (!invoiceObj) return false;
	confirm(
		'Confirm Payment Summary',
		'<div id="InvoiceSummary"></div>',
		'yes, do it', 'cancel',
		null,function(){
			setTimeout(function(){
				saveInvoice(invoiceObj);
			},250)
		}
	);
	$("#InvoiceSummary").replaceWith(invoiceSummary(invoiceObj));
}
function invoiceSummary(invoiceObj){
	var summary = $('<div/>',{
		html: "<div class='split50KeyValues list'></div>"
	}), lineItems = "", payments = "", hasCard = false;
	$.each(invoiceObj.payments,function(x,p){
		console.log(p);
		if (p.payment_method == 'card') hasCard = true;
		payments += "<div>"+p.currency.symbol+Number(p.amount).toFixed(2)+" - "+toTitleCase(p.payment_method)+"</div>";
	})
	var prompt = "Save Invoice?";
	summary.find('.list').appendKeyValuePair('Patient',$("#PatientName").text());
	summary.find('.list').appendKeyValuePair('Payments',payments);
	summary.find('.list').appendKeyValuePair('Total Charge',"<span class='pink'>"+$('#TotalCharge').text()+"</span>");
	summary.append($('<h3 class="pink">'+prompt+'</h3>'));
	return summary;
}
function createInvoiceObj(autosave = false){
	var partialPayments = $('.partialPayment'), hasSinglePayment = (partialPayments.length == 0), payments = [], paymentForm = $("#AddPayment");
	if (!autosave){
		if (hasSinglePayment){
			if (!checkForm(paymentForm)) return false;
			payments.push(createPaymentObj());
		}else if (!$("#AddPaymentLabel").is(":visible")){
			partialPayments.each(function(){
				payments.push($(this).data());
			})
		}else{
			$("#AddPaymentBtn").click();
			return false;
		}		
	}else{
		partialPayments.each(function(){
			payments.push($(this).data());
		})
	}

	var lineItems = createLineItemObj(), notes = [];
	$("#NoteList").find(".note").each(function(){
		notes.push($(this).data());
	})
	var invoiceObj = {
		appointment_id: $("#CurrentAppt").data('uid'),
		line_items: (lineItems.length == 0) ? null : lineItems,
		total_charge: $("#TotalCharge").data('value'),
		payments: (payments.length == 0) ? null : payments,
		notes: (notes.length == 0) ? null : notes
	};
	// console.log(invoiceObj)
	return invoiceObj;
}

$.fn.appendKeyValuePair = function (key,value) {
	$(this).append($("<div class='label'>"+key+"</div><div class='value'>"+value+"</div>"))
    return this;
};
function autoSaveInvoice(){
	if (autosaveInvoiceTimer){
		clearTimeout(autosaveInvoiceTimer);
	}
	autosaveInvoiceTimer = setTimeout(function(){
		var postObj = createInvoiceObj(true);
		if (postObj.line_items == null) return;
		autosaveInvoiceXHR = $.ajax({
			url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/autosave',
			method: 'POST',
			data: createInvoiceObj(true),
			success:function(data){
				$("#ApptInfo").data('invoiceid',getUids('Invoice'));
				showAutosaveTime();
				autosaveInvoiceXHR = null;
				console.log(data);
			}
		})
	},5000);
}
function saveInvoice(invoiceObj){
	clearTimeout(autosaveInvoiceTimer);
	autosaveInvoiceTimer = null;
	if (autosaveInvoiceXHR) autosaveInvoiceXHR.abort();
	blurTopMost('#loading');
	$.ajax({
		url:'/Invoice/'+$("#ApptInfo").data('invoiceid')+'/save',
		method: 'POST',
		data: invoiceObj,
		success:function(data){
			console.log(data);
			blurTopMost("#checkmark",400,function(){
				delayedUnblurAll();
				clickTab("#invoice-index");
			});
		}
	})
}

function createLineItemObj(){
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
	return lines;
}
function updateLineItems(){
	var lineItems = $(".lineItem").not('.header');
	lineItems.each(function(){
		var price = $(this).find('.price').data('value'), 
			discount = $(this).find('.discount').find('.value').text(),
			currencySymbol = currency.symbol,
			subtotal = Number(price);
		if (discount.includes('%')){
			discount = Number(discount.replace('-','').replace('%','')) / 100;
			subtotal -= price*discount;
		}else if (discount.includes(currencySymbol)){
			discount = Number(discount.replace('-','').replace(currencySymbol,''));
			subtotal -= discount;			
		}
		var tax = ($(this).find('.tax').length == 0) ? 0 : $(this).find('.tax').find('.value').text();
		if (tax.includes('%')){
			tax = Number(tax.replace('%','')) / 100;
			subtotal += subtotal*tax;
		}
		$(this).find('.lineTotal').html(currencySymbol + subtotal.toFixed(2)).data('value',Number(subtotal));
	});
	updateInvoiceTotal();
	autoSaveInvoice();
	// console.log('should have autosaved');
}
function updatePaymentAmount(){
	var total = $("#TotalCharge").data('value'), amount = $("#AddPayment").find('.amount'), current = Number(amount.val()), payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), remainder = $("#AddPayment").find('.amount').data('max');
	if (paymentCount == 0 && current < total){
		addBtn.fadeIn();
		$("#SaveInvoiceBtn").addClass('disabled');
	}else if(paymentCount == 0){
		addBtn.fadeOut();
		$("#SaveInvoiceBtn").removeClass('disabled');
	}
}
function addPayment(){
	var form = $("#AddPayment"), obj = checkForm(form);
	if (!obj) return false;
	var payments = $(".partialPayment"), paymentCount = payments.length, addBtn = $("#AddPaymentBtn"), newPayment = createPaymentObj(), total = $("#TotalCharge").data('value'), remainder = total, amountInput = form.find('.amount'), t = newPayment.payment_method, cardType = (t == 'card') ? newPayment.details.card_type : null;
	if (paymentCount == 0){
		$('<div class="label">Payments</div><div class="value" id="PartialPayments"><div id="Remainder" class="little pink"></div></div>').insertAfter("#TotalCharge");
	}
	var title = (cardType ? cardType : "") + " " + t, 
		amountText = newPayment.currency.symbol+newPayment.amount,
		newEleHtml = '<div>'+toTitleCase(title) + " - " + amountText + '</div>';
	if (cardType){
		newEleHtml += '<div class="cardOptions flexbox"><span class="checkmark">✓</span></div>';
	}else{
		newEleHtml += '<div class="removePayment flexbox"><span>x</span></div>';
	}
	$("<div/>",{
		class: 'partialPayment flexbox leftSided',
		html: newEleHtml,
		data: newPayment
	}).insertBefore("#Remainder").on('click','.removePayment',removePayment);

	resetForm(form);
	resetMaxAmount();
	autoSaveInvoice();
}
function resetMaxAmount(){
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
	}
}
function removePayment(){
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
	resetMaxAmount();
}
function createPaymentObj(){
	var form = $("#AddPayment"), obj = {},
		paymentMethod = justResponse(form.find('.payment_method')), amount = justResponse(form.find('.amount')).split(' '),
		amountNum = amount[0], currencySymbol = amount[1];
	// console.log(amount);
	obj['payment_method'] = paymentMethod;
	obj['amount'] = amountNum;
	obj['currency'] = currency;
	obj['details'] = [];
	if (paymentMethod == 'check'){
		obj['details']['check_number'] = justResponse(form.find('.check'),false,null,true);
	}else if (paymentMethod == 'card'){
		var cardType = justResponse(form.find('.card_type'),false,null,true);
		obj['details']['card_type'] = cardType;
	}
	return obj;
}
function updateInvoiceTotal(){
	var lineItems = $(".lineItem").not('.header');
	if (lineItems.length == 0) return false;
	var subtotal = 0, currencySymbol = currency.symbol;
	lineItems.each(function(){
		subtotal += $(this).find('.lineTotal').data('value');
	});
	// console.log(subtotal);
	$("#TotalCharge").html(currencySymbol+subtotal.toFixed(2)).data('value',subtotal);
	resetMaxAmount();
}
function openStripeModal(){
	clearTimeout(autosaveInvoiceTimer);
	var name = $("#PatientName").text(), amount = $("#AddPayment").find('.amount').val();
	$("#StripePaymentDetails").text(name + " - " + currency.symbol + amount);
	blurTopMost("#StripeModal");
	getPaymentIntent();
}
function getPaymentIntent(){
	var amount = Number($("#AddPayment").find('.amount').val()), invoiceeId = $("#PatientName").data('userid'), stripeAmount = (currency.abbr == 'usd') ? amount*100 : amount;
		data = {
			amount: stripeAmount,
			currency: currency.abbr
		};
		$.ajax({
			url: '/user/'+invoiceeId+'/get-payment-intent',
			method: "POST",
			data: {intent_options: data},
			success:function(data){
				console.log(data);
				$("#StripePaymentDetails").data('paymentIntent',data);
			}
		})
}
function confirmApptForInvoice(){
	if ($(this).hasClass('disabled')) {
		confirm('No Appointment Selected','Either select an appointment or proceed to create an invoice unattached to any appointment.<h3 class="pink">Create Invoice Without Appointment?</h3>','yes create invoice','no, go back',null,createAppointmentIndependentInvoice);
		return false;
	}
	var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
	$("#ConfirmApptForInvoice").slideFadeOut();
	// LoadingContent("#Invoice","/appointment/"+apptId+"/edit-invoice",updateLineItemList);
	LoadingContent("#Invoice","/appointment/"+apptId+"/edit-invoice");
}
function createAppointmentIndependentInvoice(){
	alert('yes hi');
}
function updateLineItemList(){
	// console.log('line items');
}