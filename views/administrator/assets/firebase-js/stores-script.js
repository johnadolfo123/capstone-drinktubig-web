let storesRef = db.collection('StoreList');
let deleteIDs = [];

// REAL TIME LISTENER
storesRef.onSnapshot(snapshot => {
	let changes = snapshot.docChanges();
	changes.forEach(change => {
		if (change.type == 'added') {
			console.log('added');
		} else if (change.type == 'modified') {
			console.log('modified');
		} else if (change.type == 'removed') {
			$('tr[data-id=' + change.doc.id + ']').remove();
			console.log('removed');
		}
	});
});

// GET TOTAL SIZE
storesRef.onSnapshot(snapshot => {
	let size = snapshot.size;
	$('.count').text(size);
	if (size == 0) {
		$('#selectAll').attr('disabled', true);
	} else {
		$('#selectAll').attr('disabled', false);
	}
});


 const displayStores = async (doc) => {
    console.log('displayStores');

    let stores = storesRef;
    // .startAfter(doc || 0).limit(10000)

    const data = await stores.get();

    data.docs.forEach(doc => {
        const stores = doc.data();
        var store_status = stores.StoreStatus; 
   
       	// display user status
		 if(store_status == 'Verified') {
		        	var display = '<span class="status-p bg-success">Verified</span>';
		        	var display_accept = '';
		        } else if(store_status == 'Not-Verified') {
		        	var display = '<span class="status-p bg-danger">Not Verified</span>';
		        	var display_accept = `<a href="#acceptStoresModal" data-toggle="modal" id="${doc.id}" class="edit js-accept-stores btn btn-primary btn-sm">
							ACCEPT 
						</a>`;
		        }

        let item =
            `<tr data-id="${doc.id}">
                    <td class="stores-name">${stores.StoreName}</td>
                    <td class="stores-address">${stores.StoreLocation}</td>
                    <td class="stores-phone">${stores.StoreContactNumber}</td>
                    <td class="stores-phone">${stores.StoreOpen}</td>
                    <td class="stores-status">${display}</td>
            		<td>
            			${display_accept}
						<a href="view_stores_product.html?id=${doc.id}" id="${doc.id}" class="view btn btn-info btn-sm js-view-stores">VIEW</a>
						</a>
					</td>
            </tr>`;

        $('#stores-table').append(item);
    });

    // UPDATE LATEST DOC
    latestDoc = data.docs[data.docs.length - 1];

}

// addTestData();

$(document).ready(function () {

	let latestDoc = null;

	// LOAD INITIAL DATA
	displayStores();

	// LOAD MORE
	$(document).on('click', '.js-loadmore', function () {
		displayStores(latestDoc);
	});

	
	// Accept Store
	$(document).on('click', '.js-accept-stores', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		console.log(id);
		$('#accept-stores-form').attr('accept-id', id);
		$('#acceptStoresModal').modal('show');
	});

	$("#accept-stores-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('accept-id');
		let storeStatus = "Verified";
			if (id != undefined) {
			db.collection('StoreList').doc(id).update({
			StoreStatus: storeStatus
			// name: employeeName,
			// email: employeeEmail,
			// address: employeeAddress,
			// phone: employeePhone,
			// updatedAt : firebase.firestore.FieldValue.serverTimestamp()
			})
			 .then(function () {
					 location.href = "view_stores.html";
					 //$("#acceptStoresModal").modal('hide');
				})
				.catch(function (error) {
					console.error("Error deleting document: ", error);
				});
		} else {
			// let checkbox = $('table tbody input:checked');
			// checkbox.each(function () {
			// 	db.collection('employees').doc(this.value).delete()
			// 		.then(function () {
			// 			console.log("Document successfully delete!");
			// 			displayEmployees();
			// 		})
			// 		.catch(function (error) {
			// 			console.error("Error deleting document: ", error);
			// 		});
			// });
			$("#acceptStoresModal").modal('hide');
		}
	});
	// DELETE END


	// SEARCH
	$("#search-name").keyup(function () {
		$('#employee-table tbody').html('');
		let nameKeyword = $("#search-name").val();
		console.log(nameKeyword);
		storesRef.orderBy('name', 'asc').startAt(nameKeyword).endAt(nameKeyword + "\uf8ff").get()
			.then(function (documentSnapshots) {
				documentSnapshots.docs.forEach(doc => {
					renderEmployee(doc);
				});
			});
	});

	// RESET FORMS
	$("#addEmployeeModal").on('hidden.bs.modal', function () {
		$('#add-employee-form .form-control').val('');
	});

	$("#editEmployeeModal").on('hidden.bs.modal', function () {
		$('#edit-employee-form .form-control').val('');
	});
});

// CENTER MODAL
(function ($) {
	"use strict";

	function centerModal() {
		$(this).css('display', 'block');
		var $dialog = $(this).find(".modal-dialog"),
			offset = ($(window).height() - $dialog.height()) / 2,
			bottomMargin = parseInt($dialog.css('marginBottom'), 10);

		// Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
		if (offset < bottomMargin) offset = bottomMargin;
		$dialog.css("margin-top", offset);
	}

	$(document).on('show.bs.modal', '.modal', centerModal);
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
}(jQuery));