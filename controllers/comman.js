
var FCM = require('fcm-node');
// var serverKey = 'AIzaSyAqWbHyWGrOhu85BOSnBdVroMDIQscKcx0'; //put your server key here
var serverKey = 'AIzaSyCqwCVN42cntueZaPnpNCIzvOBJU-VNb4Q'; //put your server key here

var fcm = new FCM(serverKey);
var apn = require("apn"),
    options, connection, notification;

exports.sendNotificationForAndroid=(deviceToken,title, msg, type, roomid, receiver, sender, fullName, desc,propertyTitle, callback)=>{
    var message = {
        to: deviceToken,
        // notification: {
        //     title: title,
        //     body: msg,
        //     type: type
        // },
        data: {
            title: title,
            message: msg,
            type: type, 
            receiver: receiver, 
            fullName: fullName,
            roomid:roomid,
            sender:sender,
            desc:desc,
            propertyTitle:propertyTitle
        },
    };
    fcm.send(message,(err, response)=> {
        if (err) {
            console.log("Something has gone wrong", err);
        } else {
            console.log('Notification sent successfully',response);
        }
    });
}

exports.sendiosNotification = (deviceToken,title, msg, type, roomid, receiver, sender, fullName, desc, callback) => {

    // var options = {
    //     "cert": "AqarPushDev.pem",
    //     "key": "AqarPushDev.pem",
    // };
    let data ={title:title,msg: msg, type: type, receiver, sender, roomid, fullName, desc};
    console.log('chat notificatio for ios', data)

    var options = {
        "cert": "AqarPushDistCertificates.pem",
        "key": "AqarPushDistCertificates.pem",
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = msg;
    note.alert={
        title: title,
        body: msg
    }
    note.payload = {title:title, msg: msg, type: type, receiver, sender, roomid, fullName, desc};
    note.topic = "mobulous.Aqar55";
    apnProvider.send(note, deviceToken).then((result) => {
       console.log("Ios notication send successfully is=============>",result);
      })
      .catch((e)=>{
          console.log("err in sending ios notification is==================>",e);
      })

};


exports.propertyNotificationForAndroid=(deviceToken, msg, id, type, userType, userId, callback)=>{
    console.log('===========send pAndriod', deviceToken, msg, type)
    var message = {
        to: deviceToken,
        // notification: {
        //     // title: title,
        //     body: msg,
        //     type: type
        // },
        data: {
            message: msg,
            type: type,
            userType: userType,
            userId: userId,
            id: id
        },
    };
    fcm.send(message, function(err, response) {
        if (err) {
            console.log("zSomething has gone wrong", err);
        } else {
            console.log('Property notification sent successfully',response);
        }
    });
}


exports.propertyNotificationForIos = (deviceToken, msg, id, type, userType, userId, callback) => {
    // var options = {
    //     "cert": "AqarPushDev.pem",
    //     "key": "AqarPushDev.pem",
    // };

    var options = {
        "cert": "AqarPushDistCertificates.pem",
        "key": "AqarPushDistCertificates.pem",
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = msg;
    note.alert={
        // title: title,
        body: msg
    }
    note.payload = {msg: msg, type: type, id: id,  userType: userType, userId: userId};
    note.topic = "mobulous.Aqar55";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is=============>",result);
    })
    .catch((e)=>{
        console.log("err in sending ios notification is==================>",e);
    })

};
