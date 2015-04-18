var urlUsers = "https://morning-ridge-3233.herokuapp.com/student/marti-adrogue/customers/";
var urlUser = "https://morning-ridge-3233.herokuapp.com/student/marti-adrogue/customers/";
var newUser = true;
var fields = {
  dni: document.getElementById('customer-dni'),
  name: document.getElementById('customer-name'),
  surname: document.getElementById('customer-surname'),
  address: document.getElementById('customer-address'),
  city: document.getElementById('customer-city'),
  postcode: document.getElementById('customer-postcode'), // zipcode, pcode, zcode, pc, zc, code, postc
  province: document.getElementById('customer-province'),
  email: document.getElementById('customer-email'),
  password: document.getElementById('customer-password'),
  confirmation: document.getElementById('customer-password-confirm'),
  subscription: document.getElementById('customer-accept-conditions')
};

/**
 *  TODO: Manipular el DOM mitjençant la clonació.
 */

 function ajax(url, method, data, success) {
   var request = new XMLHttpRequest();
   data = data ? JSON.stringify(data) : null;
   request.onreadystatechange = onStateChange;
   request.overrideMimeType('application/json');
   request.open(method, url, true);
   request.setRequestHeader('Content-Type', 'application/json');
   request.send(data);

   function onStateChange() {
     if (request.readyState < 4) {
       return; // not ready yet
     }
     if (request.status && (request.status < 200 || request.status >= 300)) {
       console.error('Request error', request);
       return;
     }

     // Request is complete and OK
     var result = JSON.parse(request.responseText);
     success(result);
   }
 }

 /** Aquesta funció només s'executa una sola vegada !! */
 function makeRequest(url, readRequest) {
   var xhr = new XMLHttpRequest();
   xhr.open('GET', url, true);
   xhr.onreadystatechange = onStateChange;
   xhr.overrideMimeType('application/json');
   xhr.setRequestHeader('Content-Type', 'application/json');
   xhr.send(null);

   function onStateChange () {
     if(xhr.readyState === 4){ // request is done
       if(xhr.status === 200){ // successful return
         readRequest(xhr);
       }else{
         console.warn('There was a problem with the request');
       }
     }
   }
 }

 function readUsers(users) {
   var list = document.getElementById('customer-list');
   list.innerHTML = '';
   for (var i = 0; i < users.length; i++) {
     addUser(list, users[i]);
   }
 }
 function readUser(user) {
   cleanForm();
   fillForm(user);
 }

 function addUser(list, user) {
   var item = document.createElement('li');
   var link = document.createElement('a');
   link.textContent = user.name + ' ' + user.surname;
   link.href = '#';
   link.setAttribute('data-id', user.id);
   link.addEventListener('click', onClickUserListener);
   item.appendChild(link);
   list.appendChild(item);
 }

 function onClickUserListener(event) {
   event.preventDefault();
   event = event || window.event;
   cleanList();
   var target = (typeof event.target !== 'undefined') ? event.target : event.srcElement;
   var li = target.parentNode;
   li.classList.add('active');
   var uri = urlUser + target.dataset.id;
   ajax(uri, 'GET', null, readUser);
   newUser = false;
 }

 function cleanList() {
   var list = document.getElementById('customer-list');
   var items = list.getElementsByTagName('li');
   for (var i = 0; i < items.length; i++) {
     items[i].classList.remove('active');
   }
 }

 function fillForm(user) {
   var id = getElementIdInput();

   id.setAttribute("value", user.id);
   fields.dni.value = user.document;
   fields.name.value = user.name;
   fields.surname.value = user.surname;
   fields.address.value = user.address;
   fields.city.value = user.city;
   fields.postcode.value = user.postcode;
   fields.province.value = user.province;
   fields.email.value = user.email;
   fields.password.value = user.password;
   fields.confirmation.value = user.password_confirmation;
   fields.subscription.checked = user.subscribed_to_bulletin;
 }

 function getElementIdInput() {
   var form = document.getElementById('customer-form');
   var id = document.getElementById('customer-id');
   if(id === null) {
     id = document.createElement('INPUT');
     id.setAttribute("type", "hidden");
     id.setAttribute("name", "id");
     id.setAttribute("id", "customer-id");
     form.appendChild(id);
   }
   return id;
 }

 function addValidation() {
   var submit = getAllElementWithDataAttribute('save');
   submit.addEventListener('click', onClickSaveListener);

   function onClickSaveListener(ev) {
     ev.preventDefault();
     if (isDataValid()) {
       var customer = {
         id: null,
         document: fields.dni.value,
         name: fields.name.value,
         surname: fields.surname.value,
         address: fields.address.value,
         city: fields.city.value,
         postcode:  fields.postcode.value,
         province: fields.province.value,
         email: fields.email.value,
         password: fields.password.value,
         password_confirmation: fields.confirmation.value,
         subscribed_to_bulletin: fields.subscription.checked
       };

       if (newUser) {
         ajax(urlUsers, 'POST', customer, function(user) {
           var list = document.getElementById('customer-list');
           addUser(list, user);
         });
       } else {
         var id = document.getElementById('customer-id');
         customer.id = id.value;

         ajax(urlUser + id.value, 'PUT', customer, function(user) {
           var item = document.querySelector('[data-id="'+user.id+'"]');
           item.textContent = user.name + ' ' + user.surname;
         });
       }
       newUser = false;
     }
   }
 }

 function getAllElementWithDataAttribute(value) {
   var matchingElements;
   var allElements = document.querySelectorAll('[data-action]');
   for (var i = 0, n = allElements.length; i < n; i++) {
     if (allElements[i].dataset.action === value) {
       matchingElements = allElements[i];
       break;
     }
   }
   return matchingElements;
 }

 function isDataValid() {
   var dni = fields.dni.value;
   var postcode = fields.postcode.value;
   var password = fields.password.value;
   var confirmation = fields.confirmation.value;
   var valid = true;

   var char = dni.slice(-1);
   if (/[^A-Z^a-z]/i.test(char) || dni.length !== 9) {
     alert('DNI\'s wrong!');
     valid = false;
   } else if (postcode !== '') {
     if (postcode.length !== 5) {
       alert('Postcode\'s wrong.');
       valid = false;
     }
   } else if (password.length < 5 || password !== confirmation) {
     alert('Password\'s worng.');
     valid = false;
   }
   return valid;
 }


 function populateSelect() {
   var select = document.getElementById('customer-province');
   SPAIN_PROVINCES.forEach(function(province) {
     var option = document.createElement('option');
     option.value = province.id;
     option.text = province.name;
     select.appendChild(option);
   });
 }
 function prepareNewUser () {
   var btnNewUser = document.getElementById('new-customer-button');
   btnNewUser.addEventListener('click', function(e) {
     newUser = true;
     cleanForm ();
   });
 }

 function prepareDeleteUser () {
   var btnDeleteUser = document.querySelector('[type="button"]');
   btnDeleteUser.addEventListener('click', function(e) {
     cleanForm ();

     if (!newUser) {
       var id = document.getElementById('customer-id');
       ajax(urlUsers + id.value, 'DELETE', null, function() {
         var list = document.getElementById('customer-list');
         var link = document.querySelector('[data-id="'+id.value+'"]');
         var item = link.parentNode;
         list.removeChild(item);
       });
     }
   });
 }

 function cleanForm () {
   fields.dni.value = '';
   fields.name.value = '';
   fields.surname.value = '';
   fields.address.value = '';
   fields.city.value = '';
   fields.postcode.value = '';
   fields.province.value = '';
   fields.email.value = '';
   fields.password.value = '';
   fields.confirmation.value = '';
   fields.subscription.checked = '';
 }

 prepareNewUser();
 prepareDeleteUser();

 populateSelect();
 addValidation();
 ajax(urlUsers, 'GET', null, readUsers);
