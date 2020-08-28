const express = require('express');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
var fs = require('fs');
var Chat = require('./models/chatModel');
var Room = require('./models/roomModel');
var User = require('./models/userModel');
var Notification = require('./models/notificationModel');
var ChatUser = require('./models/chatUserModel');
var AdminChat = require('./models/adminChatModel');
var Block = require('./models/blockModel');
const func = require('./controllers/comman.js');
var ObjectId = require('mongodb').ObjectId;
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://127.0.0.1:27017/realstate', { useNewUrlParser: true }, (err) => {
	if (err) {
		console.log('Error in connecting with db')
	} else {
		console.log('Successfully connected db')
	}
});
// server.use('/chat', app.static(__dirname + '/public'));
server.listen(3004, function () {
	console.log('running on port no : 3004');
});
var Files = {};

io.on('connection', function (socket) {
	console.log('an user connected', socket.id);
	socket.on('initialChat', (data) => {
		console.log(JSON.stringify(data))

		if (data.sender_id && data.receiver_id && data.message) {
			if (data.room_id) {
				console.log('inshad 1')
				Room.findOne({ "room_id": data.room_id }).then(result => {
					if (result) {
						if (data.room_id != null && data.room_id != "" && data.message != null && data.message != "") {
							console.log('req for chat not ininitaila', data)
							var chat = new Chat({
								"room_id": data.room_id,
								"sender_id": data.sender_id,
								"receiver_id": data.receiver_id,
								"message": data.message,
								"attachment_type": data.attachment_type,
							});
							var query = { $or: [{ $and: [{ "block_from": data.sender_id }, { "block_to": data.receiver_id }] }, { $and: [{ "block_to": data.sender_id }, { "block_from": data.receiver_id }] }] }
							Block.findOne(query, (err, res) => {
								if (err) {
									console.log(err)
								} else if (res) {
									console.log('User is blocked either by sender or receiver')
									socket.emit('initialChat', { msg: 'User is blocked either by sender or receiver' });
								} else {
									chat.save((error2, result2) => {
										if (error2) {
											console.log("error2 is===========>", error2);
										} else {
											console.log("room_id 23", data.room_id);
											socket.join(data.room_id, () => {
												io.to(data.room_id).emit('initialChat', result2);
											});
											User.findOne({ _id: data.receiver_id }, (err4, result4) => {
												if (err4) {
													console.log(err4)
												} else if (!result4) {
													console.log('invalid receiver id')
												} else {
													User.findOne({ _id: data.sender_id }, (err5, result5) => {
														if (err5) {
															console.log(err5)
														} else if (!result5) {
															console.log('invalid receiver id')
														} else {
															console.log('ussse receiver_id', result4.deviceToken, result4.notification, result5.fullName, data.message)
															var notification = new Notification({
																"userId": data.receiver_id,
																"notificationSender": data.sender_id,
																"notificationReceiver": data.receiver_id,
																"propOrRoomOrUserId": data.room_id,
																"title": result5.fullName + ' messaged you',
																"notificationType": "chat",
																"message": data.message,
																"propertyTitle": data.title,
																"description": data.description
															});
															notification.save((error3, result3) => {
																if (error3) {
																	console.log("error3 is===========>", error3);
																} else {
																	if (result4.deviceToken && result4.notification == true) {
																		func.sendNotificationForAndroid(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", data.room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, data.title, (error3, result3) => {
																			if (error3) {
																				console.log("Error 3 is=========>", error3);
																			} else {
																				console.log("Send android notification is=============>", result3);
																			}
																		})
																	}
																	if (result4.deviceType == 'IOS' && result4.notification == true) {
																		func.sendiosNotification(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", data.room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, (error11, result11) => {
																			if (error11) {
																				console.log("Error 3 is=========>", error11);
																			} else {
																				console.log("arSend ios notification is=============>", result11);
																			}
																		})
																	}
																}
															})
														}

													})

												}
											})
										}
									})
									Room.updateMany({ room_id: data.room_id }, { $set: { "lastmessage": data.message ,'description':data.description} }, (error4, result4) => {
										if (error4) {
											console.log("error4 is===========>", error4);
										} else {
											console.log('msg updated')
										}
									})
								}
							})

						} else {
							io.to(data.room_id).emit('initialChat', { msg: 'Please send correct data' });
						}
					} else {
						io.to(data.room_id).emit('initialChat', { msg: 'Please send correct room_id' });
					}

				}, err => {
					io.to(data.room_id).emit('initialChat', { msg: 'Chat server incounter some error at line number 141', error: err });
				})
			} else {

				var reqQuery = { $or: [{ $and: [{ "sender_id": ObjectId(data.sender_id) }, { "receiver_id": ObjectId(data.receiver_id) }] }, { $and: [{ "receiver_id": ObjectId(data.sender_id) }, { "sender_id": ObjectId(data.receiver_id) }] }] }
				Room.findOne(reqQuery).then(roomFind => {

					if (roomFind) {
						console.log('inshad 2')
						if (data.message != null && data.message != "") {
							console.log('req for chat not ininitaila', data)
							var chat = new Chat({
								"room_id": roomFind.room_id,
								"sender_id": data.sender_id,
								"receiver_id": data.receiver_id,
								"message": data.message,
								"attachment_type": data.attachment_type,
							});
							var query = { $or: [{ $and: [{ "block_from": data.sender_id }, { "block_to": data.receiver_id }] }, { $and: [{ "block_to": data.sender_id }, { "block_from": data.receiver_id }] }] }
							Block.findOne(query, (err, res) => {
								if (err) {
									console.log(err)
								} else if (res) {
									console.log('User is blocked either by sender or receiver')
									socket.emit('initialChat', { msg: 'User is blocked either by sender or receiver' });
								} else {
									chat.save((error2, result2) => {
										if (error2) {
											console.log("error2 is===========>", error2);
										} else {
											console.log("room_id 23", data.room_id);
											socket.join(data.room_id, () => {
												io.to(data.room_id).emit('initialChat', result2);
											});
											User.findOne({ _id: data.receiver_id }, (err4, result4) => {
												if (err4) {
													console.log(err4)
												} else if (!result4) {
													console.log('invalid receiver id')
												} else {
													User.findOne({ _id: data.sender_id }, (err5, result5) => {
														if (err5) {
															console.log(err5)
														} else if (!result5) {
															console.log('invalid receiver id')
														} else {
															console.log('ussse receiver_id', result4.deviceToken, result4.notification, result5.fullName, data.message)
															var notification = new Notification({
																"userId": data.receiver_id,
																"notificationSender": data.sender_id,
																"notificationReceiver": data.receiver_id,
																"propOrRoomOrUserId": data.room_id,
																"title": result5.fullName + ' messaged you',
																"notificationType": "chat",
																"message": data.message,
																"propertyTitle": data.title,
																"description": data.description
															});
															notification.save((error3, result3) => {
																if (error3) {
																	console.log("error3 is===========>", error3);
																} else {
																	if (result4.deviceToken && result4.notification == true) {
																		func.sendNotificationForAndroid(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", data.room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, data.title, (error3, result3) => {
																			if (error3) {
																				console.log("Error 3 is=========>", error3);
																			} else {
																				console.log("Send android notification is=============>", result3);
																			}
																		})
																	}
																	if (result4.deviceType == 'IOS' && result4.notification == true) {
																		func.sendiosNotification(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", data.room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, (error11, result11) => {
																			if (error11) {
																				console.log("Error 3 is=========>", error11);
																			} else {
																				console.log("arSend ios notification is=============>", result11);
																			}
																		})
																	}
																}
															})
														}

													})

												}
											})
										}
									})
									Room.updateMany({ room_id: data.room_id }, { $set: { "lastmessage": data.message ,'description':data.description} }, (error4, result4) => {
										if (error4) {
											console.log("error4 is===========>", error4);
										} else {
											console.log('msg updated')
										}
									})
								}
							})

						} else {
							io.to(data.room_id).emit('initialChat', { msg: 'Please send correct data' });
						}
					} else {
						console.log('inshad 3')
						var room_id = data.sender_id + data.receiver_id;
						var chatJSon = {
							"room_id": room_id,
							"sender_id": data.sender_id,
							"receiver_id": data.receiver_id,
							"message": data.message,
							"attachment_type": data.attachment_type,
						}
						let room = [{
							"sender_id": data.sender_id,
							"receiver_id": data.receiver_id,
							"property_id": data.property_id,
							"lastmessage": data.message,
							"title": data.title,
							"description": data.description,
							"room_id": room_id,
						},
						{
							"sender_id": data.receiver_id,
							"receiver_id": data.sender_id,
							"property_id": data.property_id,
							"lastmessage": data.message,
							"title": data.title,
							"description": data.description,
							"room_id": room_id,

						}]

						console.log("Room is============>", room);
						var query = { $or: [{ $and: [{ "block_from": data.sender_id }, { "block_to": data.receiver_id }] }, { $and: [{ "block_to": data.sender_id }, { "block_from": data.receiver_id }] }] }
						Block.findOne(query, (err, res) => {
							if (err) {
								console.log(err)
							} else if (res) {
								socket.emit('initialChat', { msg: 'User is blocked either by sender or receiver' });
							} else {
								Chat.create(chatJSon, (error1, result1) => {
									if (error1) {
										console.log("error1 is===========>", error1);
									} else {
										console.log("room_id 1", room_id);
										//	socket.emit('initialChat', result1);
										socket.join(room_id, () => {
											io.to(room_id).emit('initialChat', result1);
										});
										Room.create(room, (error2, result2) => {
											if (error2) {
												console.log("error2 is===========>", error2);
											} else {
												console.log('room saved')
												User.findOne({ _id: data.receiver_id }, (err4, result4) => {
													if (err4) {
														console.log(err4)
													} else if (!result4) {
														console.log('invalid receiver id')
													} else {
														User.findOne({ _id: data.sender_id }, (err5, result5) => {
															if (err5) {
																console.log(err5)
															} else if (!result5) {
																console.log('invalid sender id')
															} else {
																console.log('ussse receiver_id', result4.deviceToken, result4.notification, result5.fullName, data.message)
																var notification = new Notification({
																	"userId": data.receiver_id,
																	"notificationSender": data.sender_id,
																	"notificationReceiver": data.receiver_id,
																	"propOrRoomOrUserId": room_id,
																	"title": result5.fullName + ' messaged you',
																	"notificationType": "chat",
																	"message": data.message,
																});
																notification.save((error3, result3) => {
																	if (error3) {
																		console.log("error3 is===========>", error3);
																	} else {
																		if (result4.deviceToken && result4.notification == true) {
																			func.sendNotificationForAndroid(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, data.title, (error3, result3) => {
																				if (error3) {
																					console.log("Error 3 is=========>", error3);
																				} else {
																					console.log("Send android notification is=============>", result3);
																				}
																			})
																		}
																		if (result4.deviceType == 'IOS' && result4.notification == true) {
																			func.sendiosNotification(result4.deviceToken, result5.fullName + ' messaged you', data.message, "chat", room_id, data.receiver_id, data.sender_id, result5.fullName, data.description, (error11, result11) => {
																				if (error11) {
																					console.log("Error 3 is=========>", error11);
																				} else {
																					console.log("Send notification is=============>", result11);
																				}
																			})
																		}
																	}
																})
															}

														})

													}
												})

											}
										})
									}
								})
							}
						})



					}

				}, error => {
					socket.emit('initialChat', { msg: 'User is blocked either by sender or receiver' });
				})
			}
		} else {
			socket.emit('initialChat', { msg: 'Please send correct data ' });
		}


	})

	socket.on('getRoomId', (data) => {
		var query = { $and: [{ "sender_id": data.sender_id }, { "receiver_id": data.receiver_id }] }
		Room.findOne(query, (error, result) => {
			if (error) {
				console.log("error getroomid is===========>", error);
			} else if (!result) {
				socket.emit('getRoomId', { Data: 'invalid sender & receiver id' });
			} else {
				socket.emit('getRoomId', { Data: result });
			}
		})
	})

	socket.on('chatUserList', (data) => {
		ChatUser.find({ receiver_id: req.body.userId }, (err, result) => {
			if (err) {
				console.log('error chatuser list==>', err)
			} else if (result.length == 0) {
				console.log('No chat users found');
				return res.send({ response_code: 200, response_message: 'No chats found', Data: [] })
			} else {
				console.log('chats found successfully')
				return res.send({ response_code: 200, response_message: "Chat users found successfully", Data: result });
			}
		})
	})

	socket.on('uploadFileStart', function (data) {
		console.log("Data is==========>", data);
		var fileName = data[0].Name;
		var fileSize = data[0].Size;
		var Place = 0;
		var directory = '/var/www/html/realstate/public/'
		if (fs.existsSync(directory)) {

		} else {
			fs.mkdir(directory)
		}
		var uploadFilePath = directory + '/' + fileName;
		console.log('uploadFileStart # Uploading file: %s to %s. Complete file size: %d', fileName, uploadFilePath, fileSize);
		Files[fileName] = {
			FileSize: fileSize,
			Data: "",
			Downloaded: 0
		}
		fs.open(uploadFilePath, "a", 0755, function (err, fd) {
			if (err) {
				console.log(err);
			}
			else {
				console.log('uploadFileStart # Requesting Place: %d Percent %d', Place, 0);
				Files[fileName]['Handler'] = fd;
				socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': 0 });
			}
		});
	});

	socket.on('uploadFileChuncks', function (data) {

		console.log('data is===============>', data[0])
		var Name = data[0].Name;
		var base64Data = data[0].Data;
		var playload = new Buffer(base64Data, 'base64').toString('binary');


		console.log('uploadFileChuncks # Got name: %s, received chunk size %d.', Name, playload.length);
		if (data[0].flag == 'new') {
			Files[Name]['Downloaded'] = playload.length;
			Files[Name]['Data'] = playload;
		} else {
			Files[Name]['Downloaded'] += playload.length;
			Files[Name]['Data'] += playload;
		}
		if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) {
			console.log('uploadFileChuncks # File %s receive completed', Name);
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
				fs.close(Files[Name]['Handler'], function () {
					console.log('file closed');
				});

				console.log('ravi kant', data[0].room_id)
				if (data[0].room_id) {
					if (data[0].sender_id != null && data[0].sender_id != '' && data[0].receiver_id != null && data[0].receiver_id != '' &&
						data[0].attachment_type != '' && data[0].attachment_type != null) {
						var message = data[0];
						message.attachment = Name
						message.Data = Name;
						message.attachment = 'http://18.189.223.53/realstate/public/' + Name;
						message.attachment_type = message.attachment_type;
						message.created = new Date().toISOString();
						message.sender_id = message.sender_id;
						message.room_id = data[0].room_id;
						console.log('Message is===========>', message)
						console.log("Path is=========>", 'http://18.217.0.63/realstate/public/' + Name)
						socket.emit('uploadFileCompleteRes', { 'IsSuccess': true, 'message': message });

						//Abhishek code

						socket.join(message.room_id, () => {
							io.to(message.room_id).emit('initialChat', message);
						})

						//Inshad sir code
						// io.to(message.room_id).emit('initialChat', message);
						console.log('file complete')
						//io.to(message.room_id).emit('initialChat', message)
						var chatJSon = {
							"room_id": message.room_id,
							"sender_id": message.sender_id,
							"receiver_id": message.receiver_id,
							"attachment": message.attachment,
							"attachment_type": message.attachment_type,
						}
						Chat.create(chatJSon, (err, result) => {
							if (err) {
								console.log(err, 'err in media saving 1')
							} else {
								console.log(result, 'err in media saving 2')
							}
						})
					}
					else {
						console.log('wrong data')
					}
				} else {
					if (data[0].sender_id != null && data[0].sender_id != '' && data[0].receiver_id != null && data[0].receiver_id != '' &&
						data[0].attachment_type != '' && data[0].attachment_type != null) {
						var message = data[0];
						message.attachment = Name
						message.Data = Name;
						message.attachment = 'http://18.189.223.53/realstate/public/' + Name;
						message.attachment_type = message.attachment_type;
						message.created = new Date().toISOString();
						message.sender_id = message.sender_id;
						message.room_id = data[0].sender_id + data[0].receiver_id;
						console.log('Message is===========>', message)
						console.log("Path is=========>", 'http://18.217.0.63/realstate/public/' + Name)
						socket.emit('uploadFileCompleteRes', { 'IsSuccess': true, 'message': message });
						socket.join(message.room_id, () => {
							io.to(message.room_id).emit('initialChat', message);
						})
						console.log('file complete')
						var chatJSon = {
							"room_id": message.room_id,
							"sender_id": message.sender_id,
							"receiver_id": message.receiver_id,
							"attachment": message.attachment,
							"attachment_type": message.attachment_type,
						}

						let room = [{
							"room_id": message.room_id,
							"sender_id": message.receiver_id,
							"receiver_id": message.sender_id,
							"lastmessage": message.message,
							"title": message.title,
							"description": message.description
						}, {
							"room_id": message.room_id,
							"sender_id": message.sender_id,
							"receiver_id": message.receiver_id,
							"lastmessage": message.message,
							"title": message.title,
							"description": message.description
						}]
						Chat.create(chatJSon, (err, result) => {
							if (err) {
								console.log(err, 'err in media saving')
							} else {
								Room.create(room, (error2, result2) => {
									if (err) {
										console.log(err, 'err in media saving 3')
									} else {
										User.findOne({ _id: data[0].receiver_id }, (err4, result4) => {
											if (err4) {
												console.log(err4)
											} else if (!result4) {
												console.log('invalid receiver id')
											} else {
												User.findOne({ _id: data[0].sender_id }, (err5, result5) => {
													if (err5) {
														console.log(err5)
													} else if (!result5) {
														console.log('invalid sender id')
													} else {
														var notification = new Notification({
															"userId": data[0].receiver_id,
															"notificationSender": data[0].sender_id,
															"notificationReceiver": data[0].receiver_id,
															"propOrRoomOrUserId": message.room_id,
															"title": result5.fullName + ' messaged you',
															"notificationType": "chat",
															"message": data[0].message,
															"propertyTitle": data[0].title,
															"description": data[0].description
														});
														notification.save((error3, result3) => {
															if (error3) {
																console.log("error3 is===========>", error3);
															} else {
																console.log("Notification data is==========>", result3);
																if (result4.deviceToken && result4.notification == true) {
																	func.sendNotificationForAndroid(result4.deviceToken, result5.fullName + ' messaged you', data[0].message, "chat", result5.fullName, (error3, result3) => {
																		if (error3) {
																			console.log("Error 3 is=========>", error3);
																		} else {
																			console.log("Send android notification media is=============>", result3);
																		}
																	})
																}
																if (result4.deviceType == 'IOS' && result4.notification == true) {
																	func.sendiosNotification(result4.deviceToken, result5.fullName + ' messaged you', data[0].message, "chat", result5.fullName, (error11, result11) => {
																		if (error11) {
																			console.log("Error 3 is=========>", error11);
																		} else {
																			console.log("Send ios notification media is=============>", result11);
																		}
																	})
																}
															}
														})
													}

												})

											}
										})
									}
								})

							}
						})
					}
					else {
						console.log('wrong data')
					}
				}
				// if(data[0].sender_id!=null && data[0].sender_id!='' && data[0].receiver_id!=null &&data[0].receiver_id!='' && 
				// 	data[0].attachment_type!='' && data[0].attachment_type !=null){
				//     var message=data[0];
				//     message.attachment=Name
				//     message.Data=Name;
				//     message.attachment = 'http://18.217.0.63/realstate/public/'+Name;
				//     message.attachment_type=message.attachment_type;
				//     message.created=new Date().toISOString();
				//     message.sender_id=message.sender_id;
				//     message.room_id=data[0].sender_id+data[0].receiver_id;
				// 	console.log('Message is===========>', message)
				// 	console.log("Path is=========>",'http://18.217.0.63/realstate/public/'+Name)
				// 	socket.join(message.room_id, () => {
				// 		io.to(message.room_id).emit('initialChat', message);
				// 	})
				//    	console.log('file complete')
				// 	var chatJSon = {
				//         "room_id": message.room_id,
				//         "sender_id": message.sender_id,
				//         "receiver_id": message.receiver_id,
				//         "attachment": message.attachment,
				//         "attachment_type": message.attachment_type,
				//     }  

				// 	let room=[{
				// 		"room_id": message.room_id,
				//         "sender_id": message.receiver_id,
				//         "receiver_id": message.sender_id,
				//         "lastmessage": message.message,
				//         "title": message.title,
				//     	"description": message.description
				// 	},{
				// 		"room_id": message.room_id,
				//         "sender_id": message.sender_id,
				//         "receiver_id": message.receiver_id,
				//         "lastmessage": message.message,
				//         "title": message.title,
				//     	"description": message.description
				// 	}]
				//     Chat.create(chatJSon, (err, result) => {
				//     	if(err){
				//     		console.log(err, 'err in media saving')
				//     	} else {
				//     		Room.create(room,(error2, result2) =>{ 
				//         		if(err){
				//                 	console.log(err, 'err in media saving')
				//             	} else { 
				// 	               	User.findOne({_id: data[0].receiver_id}, (err4, result4) => {
				//                 		if(err4) {
				//                 			console.log(err4)
				//                 		} else if(!result4){
				//                 			console.log('invalid receiver id')
				//                 		} else {
				//                 			User.findOne({_id: data[0].sender_id}, (err5, result5) => {
				//                 				if(err5) {
				//                 					console.log(err5)
				// 	                    		} else if(!result5){
				// 	                    			console.log('invalid sender id')
				// 	                    		} else { 
				// 							        var notification = new Notification({
				// 							        	"userId": data[0].receiver_id,
				// 							        	"notificationSender": data[0].sender_id,
				// 					                    "notificationReceiver": data[0].receiver_id,
				// 					                    "propOrRoomOrUserId":message.room_id,
				// 					                    "title": result5.fullName + ' messaged you',
				// 					                    "notificationType": "chat",
				// 					                    "message":data[0].message,
				// 					                    "propertyTitle": data[0].title,
				//     									"description": data[0].description
				// 					                });
				// 					                notification.save((error3, result3) => {
				// 					                	if (error3) {
				// 					                        console.log("error3 is===========>", error3);
				// 					                    } else { 
				// 											console.log("Notification data is==========>",result3);
				// 					                    	if (result4.deviceToken && result4.notification == true) {
				// 	                                            func.sendNotificationForAndroid(result4.deviceToken, result5.fullName + ' messaged you', data[0].message, "chat", result5.fullName, (error3, result3) => {
				// 	                                                if (error3) {
				// 	                                                    console.log("Error 3 is=========>", error3);
				// 	                                                } else {
				// 	                                                    console.log("Send android notification is=============>", result3);
				// 	                                                }
				// 	                                            })
				// 	                                        }
				// 	                                        if (result4.deviceType == 'IOS' && result4.notification == true) { 
				// 	                                            func.sendiosNotification(result4.deviceToken, result5.fullName+ ' messaged you', data[0].message, "chat", result5.fullName, (error11, result11) => {
				// 	                                                if (error11) {
				// 	                                                    console.log("Error 3 is=========>", error11);
				// 	                                                } else {
				// 	                                                    console.log("Send notification is=============>", result11);
				// 	                                                }
				// 	                                            })
				// 	                                        }
				// 					                    }
				// 					                })
				// 	                    		}

				//                 			})

				//                 		}
				//             		})
				//             	}
				//     		})

				//     	}
				//     })
				// } 
				// else{
				//   console.log('wrong data')
				// }
			});
		}
		else if (Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
			console.log('uploadFileChuncks # Updating file %s with received data', Name);
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
				Files[Name]['Data'] = ""; //Reset The Buffer
				var Place = Files[Name]['Downloaded'];
				var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
				socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': Percent });
			});
		} else {
			var Place = Files[Name]['Downloaded'];
			var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
			console.log('uploadFileChuncks # Requesting Place: %d, Percent %s', Place, Percent);
			socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': Percent });
		}
	});

	socket.on('chatDelete', function (data) {
		console.log('req for chat delete', data)
		if (data.sender_id != null && data.sender_id != '' && data.room_id != '' && data.room_id != '') {
			var query = { $and: [{ "sender_id": data.sender_id }, { "room_id": data.room_id }] }
			Chat.find({ "room_id": data.room_id }, (err, result) => {
				if (err) {
					console.log("Error is===========>", err);
				} else if (result.length == 0) {
					socket.emit('chatDetails', { Data: [] })
				} else {
					// for(var i =0; i< result.length; i++) {
					Chat.update({ "room_id": data.room_id }, { $set: { "delete_sender_id": data.sender_id } }, (err, result) => {
						if (err) {
							console.log("Error is===========>", err);
						} else {
							console.log('delete succesds', result)
							socket.emit('chatDelete', { msg: 'Deleted Successfully' })
						}
					})
					// 		if(result[i].delete_sender_id) {
					// 			Chat.updateMany({ "room_id": data.room_id }, { $set: { "delete_both" : data.sender_id } }, (err, result) => {
					//     if (err) {
					//         console.log("Error is===========>", err);
					//     } else {
					//     	console.log('delete chat ')
					//      socket.emit('chatDelete', { msg: 'Deleted Successfully' })
					//     }
					// })
					// 		} else {
					// 			Chat.updateMany({ "room_id": data.room_id }, { $set: { "delete_sender_id" : data.sender_id } }, (err, result) => {
					//     if (err) {
					//         console.log("Error is===========>", err);
					//     } else {
					//      socket.emit('chatDelete', { msg: 'Deleted Successfully' })
					//     }
					// })
					// 		}
					// }
				}
			})
		}
	})

	socket.on('blockUser', function (data) {
		console.log(data)
		if (data.room_id != null && data.room_id != '') {
			var room_id = data.sender_id + data.receiver_id;
			Room.findOneAndUpdate({ room_id: data.room_id }, { $set: { blockroom_id: room_id } }, { new: true }, (err, result) => {
				if (err) {
					console.log('err is', err2)
				} else {
					console.log('block result is', result)
				}
			})
		}
		// if(data.sender_id != null && data.sender_id != '' && data.receiver_id != '' && data.receiver_id != null) { 
		// 	var query = { $and: [{ "sender_id": data.sender_id }, { "receiver_id": data.receiver_id }] }
		// 	var room_id = data.sender_id+data.receiver_id;
		// 	Room.findOneAndUpdate(query, { $set: {blockroom_id: room_id} }, {new: true}, (err, result) => {
		//  	if(err) {
		//  		console.log('err is', err2) 
		//  	} else {
		//  		console.log('block result is', result) 
		//  	}
		//  })
		// }
	})

	socket.on('adminChat', function (data) {
		if (data.sender_id != null && data.sender_id != '') {
			var adminchat = new AdminChat({
				"sender_id": data.sender_id,
				"reason": data.reason,
				"details": data.details
			});
			adminchat.save((err, result) => {
				if (err) {
					console.log("err is===========>", err);
				} else {
					socket.join(data.sender_id, () => {
						io.to(data.sender_id).emit('adminChat', result)
					})
				}
			})
		}
	})

	socket.on('adminChatDetails', function (data) {
		if (data.sender_id != null && data.sender_id != '') {
			AdminChat.find({}, (err, result) => {
				if (err) {
					console.log('err is', err)
				} else if (result.length == 0) {
					socket.emit('adminChatDetails', { Data: [] })
				} else {
					socket.emit('adminChatDetails', { Data: result })
				}
			})
		}
	})

	// socket.on('roomEventJoin', function (msg) {
	//     console.log('room joinee', msg);
	//     var room_id = msg.sender_id+msg.receiver_id;
	//     var chatJSon = [{
	//         "room_id": room_id,
	//         "sender_id": msg.sender_id,
	//         "receiver_id": msg.receiver_id,
	//     },
	//     {
	//         "room_id": room_id,
	//         "sender_id": msg.receiver_id,
	//         "receiver_id": msg.sender_id,
	//     }]
	//     Chat.create(chatJSon, (error1, result1) => {
	//         if (error1) {
	//             console.log("error1 is===========>", error1);
	//         } else {
	//             console.log("room_id joineee 21", room_id);
	//          	socket.join(room_id, () => {
	// 		      io.to(room_id).emit('roomEventJoin', { status: true, data: msg });
	// 		    });
	//         }
	//     })
	// });

});


