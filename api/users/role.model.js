/*
Credit to Jason Watmore (https://github.com/cornflourblue) for role based authorization API example.
Source: https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api#projectstructure
*/

module.exports = {
    Level1:   1, //Viewer
    Level2:   2, //Limited Operator
    Level3:   3, //Standard Operator
    Level4:   4, //IT Operator
    Level5:   5, //Security Operator
    Level6:   6, //Reserved
    Level7:   7, //Reserved
    Level8:   8, //Reserved
    Level9:   9, //Tech
    Level10: 10, //Admin
}