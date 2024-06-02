require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: { 
    type: String, 
    unique: true 
}, 
  password: String,
  email: String,
  loginHistory: 
  [{ 
    dateTime: Date, 
    userAgent: String
 }]
});


let User; 

const initialize = () => {
    return new Promise((resolve, reject) => {
      // 데이터베이스 연결 생성
      let db = mongoose.createConnection('mongodb+srv://jheo9:34781216Pyj!@cluster0.nwne2ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
      db.on('error', (err) => {
        reject(err);
      });
  
      db.once('open', () => {
        // User 모델을 userSchema와 연결하여 초기화
        User = db.model('User', userSchema);
        resolve();
      });
    });
  };

  function registerUser(userData) {
    return new Promise(function (resolve, reject) {
        // 비밀번호 확인 필드 이름을 `password2`로 가정
        if (userData.password !== userData.password2) {
            reject("Password does not match");
        } else {
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash; // 해싱된 비밀번호로 업데이트
                let newUser = new User(userData);
                newUser.save().then(() => {
                    resolve();
                }).catch(err => {
                    if (err.code === 11000) {
                        reject("User name already exists");
                    } else {
                        reject("Error with creating the user: " + err);
                    }
                });
            }).catch(err => {
                reject("Error with password hashing: " + err);
            });
        }
    });
};

function checkUser(userData){
    return new Promise(function(resolve, reject){
      User.find({ userName: userData.userName }).exec().then(users => {
        if (users.length === 0) { // users 배열의 길이를 확인
          reject("Can't find the user: " + userData.userName);
        } else {
          bcrypt.compare(userData.password, users[0].password).then(res => {
            if (res) {
              // 최대 로그인 기록이 8개라면 하나를 제거
              if (users[0].loginHistory.length >= 8) {
                users[0].loginHistory.pop();
              }
  
              // 로그인 기록에 새 항목 추가
              users[0].loginHistory.unshift({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent
              });
  
              // 사용자 정보 업데이트
              User.updateOne({ userName: users[0].userName }, {
                $set: { loginHistory: users[0].loginHistory }
              }).exec().then(() => {
                resolve(users[0]);
              }).catch(err => {
                reject("Error with verifying: " + err);
              });
            } else {
              reject("Wrong password for user: " + userData.userName);
            }
          });
        }
      }).catch(err => {
        reject("Unable to find user: " + userData.userName);
      });
    });
  };
  
  
  module.exports = { initialize, registerUser, checkUser };