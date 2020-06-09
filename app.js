//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shagun:mlFo5VZaCqVNLegE@todolistdb-qkdea.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser : true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: [true, "Please specify name"]
  }
});

const listSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: [true, "Please specify name"]
  },
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
  name : "Welcome to your todolist"
});
const item2 = new Item ({
  name : "Hit the + button to add a new item"
});
const item3 = new Item ({
  name : "<---- Click here to delete items"
});

const defaultName = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find(function (err, items) {
    if(items.length === 0) {
      Item.insertMany(defaultName, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfull");
        }
      });
      res.redirect("/");
    } else {
      if(err) {
        console.log(err);
      } else {
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    }

  });
});

app.post("/", function(req, res){

  const item = new Item ({
    name: req.body.newItem
  });

  item.save();
  res.redirect("/");
});

app.post("/Today/delete", function(req, res) {
  console.log(req.body);
  Item.findByIdAndRemove(req.body.checkbox, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Successfull in deleting!");
      res.redirect("/")
    }
  });
});

app.get("/:listName", function(req, res){

  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, function (err, list) {
    if(err) {
      console.log(err);
    } else if(!list){
        const newList = new List ({
          name: listName,
          items: defaultName
        });
        newList.save();
        res.redirect("/" + listName);
    } else {
        res.render("list", {listTitle: list.name, newListItems: list.items});
    }
  });
});

app.post("/:listName", function(req, res){

  const listName = _.capitalize(req.params.listName);


  List.findOne({name: listName}, function (err, list) {
    if(err) {
      console.log(err);
    } else {
      const item = new Item ({
        name: req.body.newItem
      });
      list.items.push(item);
      list.save();
    }
  });
  res.redirect("/" + listName);
});

app.post("/:listName/delete", function(req, res) {

  const id = req.body.checkbox;

  const listName = _.capitalize(req.params.listName);
  List.findOneAndUpdate(
    {name: listName},
    {$pull: {items: {_id: id}}},
    function (err, list) {
    if(err) {
      console.log(err);
    } else {
      res.redirect("/" + listName);
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
