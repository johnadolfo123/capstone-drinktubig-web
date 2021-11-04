var ImgName, ImgURL;
var files = [];
var reader;

const createForm = document.querySelector('#create-form');
const eContainer = document.querySelector("#eventContainer");

const createMessage = document.querySelector("#createMessage");
const messageContainer = document.querySelector("#EmergencyContainer");

document.getElementById("attachImage").onclick = function(e) {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        files = e.target.files;
        reader = new FileReader();
        reader.onload = function() {
            document.getElementById("msgImg").src = reader.result;
        }
        reader.readAsDataURL(files[0]);
    }
    input.click();

}

document.getElementById("select").onclick = function(e) {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        files = e.target.files;
        reader = new FileReader();
        reader.onload = function() {
            document.getElementById("eventImg").src = reader.result;
        }
        reader.readAsDataURL(files[0]);
    }
    input.click();

}

document.getElementById("newMessage").onclick = function() {

    var title = createMessage.messageTitle.value;
    var content = createMessage.messageContent.value;

    var today = new Date();
    var d = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var t = today.getHours() + ":" + today.getMinutes();
    var dateTime = d + ' ~ ' + t;

    var uploadTask = storage.ref('Announcements/Messages/' + title + ".png").put(files[0]);

    uploadTask.on('state_changed', function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById("UpProgress").innerHTML = 'Upload' + progress + '%';
    }, function(err) {
        alert('Message not sent');
    }, function() {
        uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
            ImgURL = url;

            db.collection('Messages').add({
                msgTitle: title,
                msgContent: content,
                msgDate: dateTime,
                msgImage: ImgURL
            }).then(() => {
                var notification = {
                    "title": title,
                    "body": content,
                    "kind": 'msg'
                }

                var notification_body = {
                    'to': '/topics/events',
                    'data': notification,
                }

                fetch('https://fcm.googleapis.com/fcm/send', {
                    'method': 'POST',
                    'headers': {
                        'Authorization': 'key=' + 'AAAAnEcwvaM:APA91bHg_3nlwZ6J8kCW1jApOS_uYoD3z_4BxipAZuKSs12yiu7GdgWwoPdVZjkwcf0pga4WdM4G_qufc-feKozTMVcpNPbBLYs4Qy6H3OY-if4zTZPkOXDfzLsHt7yMNQFJVl-KreWT',
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify(notification_body)
                }).then(() => {
                    // res.status(200).send('Notification send successfully');
                }).catch((err) => {
                    // res.status(400).send('Notification something went wrong!');
                    console.log(err);
                })
                alert('Message Sent Successfully');
            })

        });
    })





}

document.getElementById("cEvent").onclick = function() {

    ImgName = document.getElementById('title').value;
    var uploadTask = storage.ref('Announcements/Events/' + ImgName + ".png").put(files[0]);

    uploadTask.on('state_changed', function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById("UpProgress").innerHTML = 'Upload' + progress + '%';
    }, function(err) {
        alert('error saving the image');
    }, function() {
        uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
            ImgURL = url;

            db.collection('Events').add({
                title: createForm.title.value,
                Image: ImgURL,
                date: document.getElementById("dateEvent").value,
                location: createForm.location.value,
                eventDescription: createForm.eventDescription.value,
                likes: "0"
            });
            var notification = {
                "title": createForm.title.value,
                "body": createForm.eventDescription.value,
                "kind": 'evt'
            }

            var notification_body = {
                'to': '/topics/events',
                'data': notification,
            }

            fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + 'AAAAnEcwvaM:APA91bHg_3nlwZ6J8kCW1jApOS_uYoD3z_4BxipAZuKSs12yiu7GdgWwoPdVZjkwcf0pga4WdM4G_qufc-feKozTMVcpNPbBLYs4Qy6H3OY-if4zTZPkOXDfzLsHt7yMNQFJVl-KreWT',
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify(notification_body)
            }).then(() => {
                // res.status(200).send('Notification send successfully');
            }).catch((err) => {
                // res.status(400).send('Notification something went wrong!');
                console.log(err);
            })
            alert('Event Added Successfully');
        });
    })
}

db.collection('Events').onSnapshot(snapshot => {
    let html = '';
    snapshot.forEach(doc => {
        const events = doc.data();
        const div = `
        <div class="card shadow mb-4">
        <div class="row no-gutters">
            <div class="col-md-4">
            <img src="${events.Image}" class="card-img" alt="...">
            </div>
            <div class="col-md-8">
            <div class="card-body">
              <div>
                <h5 class="fa fa-times text-danger float-right" onclick="deleteEvent('${doc.id}','${events.title}')"></h5>
                <h3 class="card-title text-success">${events.title}</h3>
              </div>
                <h6 class="card-title text-info">${events.date} | ${events.location}</h6>
                <p class="far fa-heart text-danger mb-2"><span class="text-success pl-2">${events.likes}</span></p>
                <p class="card-text text-muted">${events.eventDescription}</p>
            </div>
            </div>
        </div>
        </div>
        `;
        html += div;
    });
    eContainer.innerHTML = html;
})

db.collection('Messages').onSnapshot(snapshot => {
    let html = '';
    snapshot.forEach(doc => {
        const msg = doc.data();
        const div = `
        <div class="card my-2">
                    <div class="card-header">
                    <h5 class="fa fa-times text-danger float-right" onclick="deleteMessage('${doc.id}','${msg.msgTitle}')"></h5>
                    <h5>${msg.msgTitle}</h5>
                    </div>
                    <div class="card-body">
                      <blockquote class="blockquote mb-0">
                        <p class="text-dark ml-4">${msg.msgContent}</p>
                        <footer class="blockquote-footer float-right"><cite title="Source Title">${msg.msgDate}</cite></footer>
                      </blockquote>
                    </div>
                  </div>
        `;
        html += div;
    });
    messageContainer.innerHTML = html;
})

function deleteEvent(EventsKey, EventsTitle) {
    if (confirm("Are you sure?")) {
        var EventsRef = db.collection('Events').doc(EventsKey);
        var EventsImageRef = storage.ref('Announcements/Events/' + EventsTitle + ".png");

        EventsRef.delete();
        EventsImageRef.delete();
    }
}

function deleteMessage(messageKey, mesgTitle) {
    if (confirm("Are you sure?")) {
        var msgRef = db.collection('Messages').doc(messageKey);
        var msgImgRef = storage.ref('Announcements/Messages/' + mesgTitle + ".png");

        msgRef.delete();
        msgImgRef.delete();
    }
}