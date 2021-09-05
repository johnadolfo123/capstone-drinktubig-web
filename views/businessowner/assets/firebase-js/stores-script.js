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
        let item =
             `<tr data-id="${doc.id}">
             		<td class="stores-name">${stores.StoreName}</td>
                    <td class="stores-address">${stores.StoreLocation}</td>
                    <td class="stores-address">${stores.StoreSitio}</td>
                    <td class="stores-phone">${stores.StoreContactNumber}</td>
                    <td class="stores-opentime">${stores.StoreOpen}</td>
                    <td class="stores-status"><span class="status-p bg-danger">Not Verified</span></td>
            		<td>
						<a href="#" id="${doc.id}" class="view js-view-stores btn btn-info btn-sm">
							VIEW
						</a>
					</td>
					<td>
						<a href="#editStoresModal" data-toggle="modal" id="${doc.id}" class="edit js-edit-stores btn btn-primary btn-sm">
							EDIT 
						</a>
					</td>
					<td>
						<a href="#deleteStoresModal" data-toggle="modal" id="${doc.id}" class="delete js-delete-stores btn btn-danger btn-sm">
							DELETE 
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

	// ADD STORES
	$("#add-stores-form").submit(function (event) {
		event.preventDefault();
		let storesName = $('#stores-name').val();
		let storesAddress = $('#stores-address').val();
		let storesSitio = $('#stores-sitio').val();
		let storesPhone =  $('#stores-phone').val();
		let storesOpen = '9:00AM';

		// let storeID = storesName+storesSitio; unya nalang ni haha

		db.collection('StoreList').add({
			StoreName: storesName,
			StoreLocation: storesAddress,
			StoreSitio: storesSitio,
			StoreContactNumber: storesPhone
			// createdAt : firebase.firestore.FieldValue.serverTimestamp()
			}).then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
				$("#addStoresModal").modal('hide');
				let newStores =
				 `<tr data-id="${docRef.id}">
				 	<td class="stores-name">${storesName}</td>
                    <td class="stores-address">${storesAddress}</td>
                    <td class="stores-sitio">${storesSitio}</td>
                    <td class="stores-phone">${storesPhone}</td>
                    <td class="stores-phone">${storesOpen}</td>
                    <td class="stores-status"><span class="status-p bg-danger">Not Verified</span></td>
            		<td>
						<a href="#" id="${docRef.id}" class="delete-id js-delete-stores"><a href="view_stores_product.html" class="btn btn-info btn-sm">VIEW</a>
						</a>
					</td>
					<td>
						<a href="#editStoresModal" data-toggle="modal" id="${docRef.id}" class="edit js-edit-stores btn btn-primary btn-sm">
							EDIT 
						</a>
					</td>
					<td>
						<a href="#deleteStoresModal" data-toggle="modal" id="${docRef.id}" class="delete js-delete-stores btn btn-danger btn-sm">
							DELETE 
						</a>
					</td>
            </tr>`;

			$('#stores-table tbody').prepend(newStores);
			})
			.catch(function (error) {
				console.error("Error writing document: ", error);
			});
	});

	// UPDATE STORES
	$(document).on('click', '.js-edit-stores', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		$('#edit-stores-form').attr('edit-id', id);
		db.collection('StoreList').doc(id).get().then(function (document) {
			if (document.exists) {
				$('#edit-stores-form #stores-name').val(document.data().StoreName);
				$('#edit-stores-form #stores-address').val(document.data().StoreLocation);
				$('#edit-stores-form #stores-phone').val(document.data().StoreContactNumber);
				$('#edit-stores-form #stores-opentime');
				$('#editStoresModal').modal('show');
			} else {
				console.log("No such document!");
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});
	});

	$("#edit-stores-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('edit-id');
		let storeName = $('#edit-stores-form #stores-name').val();
		let storeAddress = $('#edit-stores-form #stores-address').val();
		let storePhone =  $('#edit-stores-form  #stores-phone').val();

		db.collection('StoreList').doc(id).update({
			StoreName: storeName,
			StoreLocation: storeAddress,
			StoreContactNumber: storePhone,
			updatedAt : firebase.firestore.FieldValue.serverTimestamp()
		});

		$('#editStoresModal').modal('hide');

		// SHOW UPDATED DATA ON BROWSER
		$('tr[data-id=' + id + '] td.stores-name').html(storeName);
		$('tr[data-id=' + id + '] td.stores-address').html(storeAddress);
		$('tr[data-id=' + id + '] td.stores-phone').html(storePhone);
		$('tr[data-id=' + id + '] td.stores-opentime').html('9:00 AM');
	});

	// DELETE EMPLOYEE
	$(document).on('click', '.js-delete-stores', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		$('#delete-stores-form').attr('delete-id', id);
		$('#deleteStoresModal').modal('show');
	});

	$("#delete-stores-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('delete-id');
		if (id != undefined) {
			db.collection('StoreList').doc(id).delete()
				.then(function () {
					console.log("Document successfully delete!");
					$("#deleteStoresModal").modal('hide');
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
			$("#deleteStoresModal").modal('hide');
		}
	});

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
	$("#addStoresModal").on('hidden.bs.modal', function () {
		$('#add-stores-form .form-control').val('');
	});

	$("#editStoresModal").on('hidden.bs.modal', function () {
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