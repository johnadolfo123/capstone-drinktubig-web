$( document ).ready(function() {
         firebase.auth().onAuthStateChanged((user) => {
              if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                var uid = user.uid;
                var user = user;

                var storeOwnerID = uid;

let storesRef = db.collection('StoreList');
let productsRef = db.collection('ProductList');

let deleteIDs = [];

// REAL TIME LISTENER
productsRef.onSnapshot(snapshot => {
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
productsRef.onSnapshot(snapshot => {
	let size = snapshot.size;
	$('.count').text(size);
	if (size == 0) {
		$('#selectAll').attr('disabled', true);
	} else {
		$('#selectAll').attr('disabled', false);
	}
});


 const displayProducts = async (doc) => {
    console.log('displayProducts');

    // let stores = sztoresRef;
    // .startAfter(doc || 0).limit(10000)

    let products = productsRef;

    let productsQuery = products.where("Store_Owner_ID", "==", storeOwnerID);
    
    const data = await productsQuery.get();

    data.docs.forEach(doc => {
        const products = doc.data();
        var product_status = products.Product_Status;
     //    let item =
     //         `<tr data-id="${doc.id}">
     //         		<td class="stores-name">${stores.StoreName}</td>
     //                <td class="stores-address">${stores.StoreLocation}</td>
     //                <td class="stores-sitio">${stores.StoreSitio}</td>
     //                <td class="stores-phone">${stores.StoreContactNumber}</td>
     //                <td class="stores-opentime">${stores.StoreOpen}</td>
     //                <td class="stores-status"><span class="status-p bg-danger">Not Verified</span></td>
     //        		<td>
					// 	<a href="view_openstores.html?id=${doc.id}" id="${doc.id}" class="view js-view-stores btn btn-info btn-sm">
					// 		VIEW
					// 	</a>
					// </td>
					// <td>
					// 	<a href="#editStoresModal" data-toggle="modal" id="${doc.id}" class="edit js-edit-stores btn btn-primary btn-sm">
					// 		EDIT 
					// 	</a>
					// </td>
					// <td>
					// 	<a href="#deleteStoresModal" data-toggle="modal" id="${doc.id}" class="delete js-delete-stores btn btn-danger btn-sm">
					// 		DELETE 
					// 	</a>
					// </td>
     //        </tr>`;


     		 // display user status
		        if(product_status == 'Available') {
		        	var display = '<span class="status-p bg-success text-center">Available</span>';
		        	//var display_accept = '';
		        	var display_accept = `<a href="#notAcceptProductModal" data-toggle="modal" id="${doc.id}" class="edit js-not-accept-products btn btn-danger btn-sm">
							Set To Not Available 
						</a>`;
		        } else if(product_status == 'Not Available') {
		        	var display = '<span class="status-p bg-danger text-center">Not Available</span>';
		        	var display_accept = `<a href="#acceptProductModal" data-toggle="modal" id="${doc.id}" class="edit js-accept-products btn btn-success btn-sm">
							Set To Available 
						</a>`;
		        }

	
             let item =
             `<tr data-id="${doc.id}">
             		<td class="products-name">${products.Product_Name}</td>
                    <td class="products-price">${products.Product_Price}</td>
                    <td class="products-category">${products.Product_Category}</td>
                    <td class="products-status">${display}</td>
            		<td class="store-branches">${products.Store_Name}</td>
            		<td>
            		${display_accept}
            		</td>
            		<td>
            			<a href="#editProductsModal" data-toggle="modal" id="${doc.id}" class="edit js-edit-products btn btn-primary btn-sm">
							EDIT 
						</a>
					</td>
					<td>
						<a href="#deleteProductsModal" data-toggle="modal" id="${doc.id}" class="delete js-delete-products btn btn-danger btn-sm">
							DELETE 
						</a>
					</td>
            </tr>`;

        $('#products-table').append(item);
    });

    // UPDATE LATEST DOC
    latestDoc = data.docs[data.docs.length - 1];

 

 // Display Store Branches In Select Form To All Verified Store Status
 var docRefTest = db.collection('StoreList');
 let storeBranches = docRefTest.where("StoreOwner_ID", "==", storeOwnerID).where("StoreStatus", "==", "Verified");

 const dataStores = await storeBranches.get();

 dataStores.docs.forEach(doc => { 

	 const branches = doc.data();

	 $('#store-branches').append('<option value="' + doc.id + '">' + branches.StoreName
     + '</option>');

});

 $("#store-branches").change(function(){
   var selectedBranchName = $(this).children("option:selected").text();
    $('#store-branches-name').val(selectedBranchName);
});

    

}

// addTestData();

$(document).ready(function () {

	let latestDoc = null;
	
	// getStoreOwnerStoreID.get().then((doc) => {
	// 	 const curr_stores = doc.data();

	// 	 console.log(curr_stores);

	// 	 var passStoreName = curr_stores.StoreName;

	//  }).catch((error) => {
 //            console.log("Error getting document:", error);
 //     }); 


	// LOAD INITIAL DATA
	displayProducts();

	// LOAD MORE
	$(document).on('click', '.js-loadmore', function () {
		displayProducts(latestDoc);
	});

	// ADD STORES
	$("#add-products-form").submit(function (event) {
		event.preventDefault();
		let productsName = $('#products-name').val();
		let productsPrice = $('#products-price').val();
		let productsCategory = $('#products-category').val();
		let productsStoreBranch = $('#store-branches').val();
		let productsStatus = 'Not Available';
		let productsStoreBranchName = $('#store-branches-name').val();
		let storeOwnerId = $('#store-owner-id').val();
		
		db.collection('ProductList').add({
			Product_Name: productsName,
			Product_Price: productsPrice,
			Product_Category: productsCategory,
			Product_Status: productsStatus,
			Store_ID: productsStoreBranch,
			Store_Name: productsStoreBranchName,
			Store_Owner_ID: storeOwnerID
			// Store_ID: getStoreOwnerStoreID,
			// Store_Name: passStoreName 
			// createdAt : firebase.firestore.FieldValue.serverTimestamp()
			}).then(function(doc) {
				console.log("Document written with ID: ", doc.id);
				$("#addProductsModal").modal('hide');
				// let newStores =
				//  `<tr data-id="${storesID}">
				//  	<td class="stores-name">${storesName}</td>
    //                 <td class="stores-address">${storesAddress}</td>
    //                 <td class="stores-sitio">${storesSitio}</td>
    //                 <td class="stores-phone">${storesPhone}</td>
    //                 <td class="stores-phone">${storesOpen}</td>
    //                 <td class="stores-status"><span class="status-p bg-danger">Not Verified</span></td>
    //         		<td>
				// 		<a href="view_openstores.html?id=${storesID}" id="${storesID}" class="delete-id js-delete-stores"><a href="view_stores_product.html" class="btn btn-info btn-sm">VIEW</a>
				// 		</a>
				// 	</td>
				// 	<td>
				// 		<a href="#editStoresModal" data-toggle="modal" id="${storesID}" class="edit js-edit-stores btn btn-primary btn-sm">
				// 			EDIT 
				// 		</a>
				// 	</td>
				// 	<td>
				// 		<a href="#deleteStoresModal" data-toggle="modal" id="${storesID}" class="delete js-delete-stores btn btn-danger btn-sm">
				// 			DELETE 
				// 		</a>
				// 	</td>
    //         </tr>`;

            let newStores =
				 `<tr data-id="${doc.id}">
				 	<td class="products-name">${productsName}</td>
                    <td class="products-price">${productsPrice}</td>
                    <td class="products-category">${productsCategory}</td>
                    <td class="products-status"><span class="status-p bg-danger">Not Available</span></td>
            		<td class="store-branches">${productsStoreBranchName}</td>
            		<td>
						<a href="#editProductsModal" data-toggle="modal" id="${doc.id}" class="edit js-edit-products btn btn-primary btn-sm">
							EDIT 
						</a>
					</td>
					<td>
						<a href="#deleteProductsModal" data-toggle="modal" id="${doc.id}" class="delete js-delete-products btn btn-danger btn-sm">
							DELETE 
						</a>
					</td>
            </tr>`;

			$('#products-table tbody').prepend(newStores);
			})
			.catch(function (error) {
				console.error("Error writing document: ", error);
			});
	});

	// UPDATE STORES
	$(document).on('click', '.js-edit-products', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		$('#edit-products-form').attr('edit-id', id);
		db.collection('ProductList').doc(id).get().then(function (document) {
			if (document.exists) {
				$('#edit-products-form #products-name').val(document.data().Product_Name);
				$('#edit-products-form #products-price').val(document.data().Product_Price);
				$('#edit-products-form #products-category').val(document.data().Product_Category);
				$('#editProductsModal').modal('show');
			} else {
				console.log("No such document!");
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});
	});

	$("#edit-products-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('edit-id');
		let productsName = $('#edit-products-form #products-name').val();
		let productsPrice = $('#edit-products-form #products-price').val();
		let productsCategory = $('#edit-products-form #products-category').val();
	
		db.collection('ProductList').doc(id).update({
			Product_Name: productsName,
			Product_Price: productsPrice,
			Product_Category: productsCategory,
			updatedAt : firebase.firestore.FieldValue.serverTimestamp()
		});

		$('#editProductsModal').modal('hide');

		// SHOW UPDATED DATA ON BROWSER
		$('tr[data-id=' + id + '] td.products-name').html(productsName);
		$('tr[data-id=' + id + '] td.products-price').html(productsPrice);
		$('tr[data-id=' + id + '] td.products-category').html(productsCategory);
	});

	// DELETE EMPLOYEE
	$(document).on('click', '.js-delete-products', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		console.log(id);
		$('#delete-products-form').attr('delete-id', id);
		$('#deleteProductsModal').modal('show');
	});

	$("#delete-products-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('delete-id');
		if (id != undefined) {
			db.collection('ProductList').doc(id).delete()
				.then(function () {
					console.log("Document successfully delete!");
					$("#deleteProductsModal").modal('hide');
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
			$("#deleteProductsModal").modal('hide');
		}
	});
	// DELETE END

	// Accept Products
	$(document).on('click', '.js-accept-products', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		console.log(id);
		$('#accept-products-form').attr('available-id', id);
		$('#acceptProductModal').modal('show');
	});

	$("#accept-products-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('available-id');
		let setAvailable = "Available";
		console.log(id);
			if (id != undefined) {
			db.collection('ProductList').doc(id).update({
			Product_Status: setAvailable
			// name: employeeName,
			// email: employeeEmail,
			// address: employeeAddress,
			// phone: employeePhone,
			// updatedAt : firebase.firestore.FieldValue.serverTimestamp()
			})
			 .then(function () {
			 		 console.log('Success');
					 location.href = "view_products.html";
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
			console.log('none');
			$("#acceptProductModal").modal('hide');
		}
	});
	// DELETE END

	// Not Accept Products
	$(document).on('click', '.js-not-accept-products', function (e) {
		e.preventDefault();
		let id = $(this).attr('id');
		console.log(id);
		$('#not-accept-products-form').attr('not-available-id', id);
		$('#notAcceptProductModal').modal('show');
	});

	$("#not-accept-products-form").submit(function (event) {
		event.preventDefault();
		let id = $(this).attr('not-available-id');
		let setNotAvailable = "Not Available";
		console.log(id);
			if (id != undefined) {
			db.collection('ProductList').doc(id).update({
			Product_Status: setNotAvailable
			// name: employeeName,
			// email: employeeEmail,
			// address: employeeAddress,
			// phone: employeePhone,
			// updatedAt : firebase.firestore.FieldValue.serverTimestamp()
			})
			 .then(function () {
			 		 console.log('Success');
					 location.href = "view_products.html";
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
			console.log('none');
			$("#notAcceptProductModal").modal('hide');
		}
	});
	// DELETE END

	// SEARCH
	$("#search-name").keyup(function () {
		$('#employee-table tbody').html('');
		let nameKeyword = $("#search-name").val();
		console.log(nameKeyword);
		productsRef.orderBy('name', 'asc').startAt(nameKeyword).endAt(nameKeyword + "\uf8ff").get()
			.then(function (documentSnapshots) {
				documentSnapshots.docs.forEach(doc => {
					renderEmployee(doc);
				});
			});
	});

	// RESET FORMS
	$("#addProductsModal").on('hidden.bs.modal', function () {
		$('#add-products-form .form-control').val('');
	});

	$("#editProductsModal").on('hidden.bs.modal', function () {
		$('#edit-products-form .form-control').val('');
	});
});

				// end of authentication user
 				 } 
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
		if (offset > bottomMargin) offset = bottomMargin;
		$dialog.css("margin-top", offset);
	}

	$(document).on('show.bs.modal', '.modal', centerModal);
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
}(jQuery));