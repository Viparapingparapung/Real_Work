const axios = require('axios')

exports.homeRoutes = (req,res) => {
    axios.get('http://localhost:3000/testprofile')
        .then(function(response){
            res.render('index', {users : response.data})
        })
        .catch(err => {
            res.send(err)
        })
}

exports.update_user = (req,res) => {

    axios.get('http://localhost:3000/testprofile', {params : { id : req.query.id}})
        .then(function(userdata){
            res.render("iduserprofile", { user : userdata.userdata})
        })
        .catch(err => {
            res.send(err);
        })
}