// Version-2 of Our Todolist App with database.
// Storing our data using database instead of arrays.
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connecting mongoose to our database (fruitsDB)
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useFindAndModify', false);

// item Schema
const itemSchema = {
  name: { type: String, required: true}
};

// collection model
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
  name: "Buy Food"
});

const item2 = new Item ({
  name: "Cook Food"
});

const item3 = new Item ({
  name: "Eat Food"
});

// arrays of item documents
const defaultItems = [item1, item2, item3];

// custom List Schema.
const listSchema = {
  name: { type: String, required: true},
  items: [itemSchema]
};

// custom list model
const List = mongoose.model("List", listSchema);

// let listsNames = [];

app.get("/", function(req, res) {

  List.find({}, function(err, allList){
    if (err) {
      console.log(err);
    } else {

      Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
          // inserting the documents to the database
          Item.insertMany(defaultItems, function(err){
            if (err) {
              console.log(err);
            } else {
              console.log("successfully saved all documents to the databse");
            }
          });
          res.redirect("/"); // after adding the defaults, redirect to the homepage
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems, tabList: allList});
        }
      });

    }
  });

  // find returns an Array of documents.

  // Item.find({}, function(err, foundItems){
  //   if (foundItems.length === 0) {
  //     // inserting the documents to the database
  //     Item.insertMany(defaultItems, function(err){
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log("successfully saved all documents to the databse");
  //       }
  //     });
  //     res.redirect("/"); // after adding the defaults, redirect to the homepage
  //   } else {
  //     res.render("list", {listTitle: "Today", newListItems: foundItems});
  //   }
  // });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //checking which list the user is adding to.
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/customList", function(req, res){
  const customListName = _.capitalize(req.body.MyCustomName);

  List.find({}, function(err, allList){
    if (err) {
      console.log(err);
    } else {
      // res.render("list", {lists: allList});
      List.findOne({name: customListName}, function(err, foundlist){
        if (!err) {
          if (!foundlist) {
            //Create a new list
            const list = new List({
              name: customListName,
              items: defaultItems
            });
    
            list.save();
    
            res.redirect("/" + customListName);
    
          }else {
            //Show an existing list
            res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items, tabList: allList});
          }
        }
      });
    
    }
  });
  
});



app.post("/add", function(req, res){
  const customName = req.body.custom;
  // const submit = req.body.customName;
//  console.log(customName);

res.redirect("/");

})


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});


app.get('/:customListName', function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.find({}, function(err, allList){
    if (err) {
      console.log(err);
    } else {
      // res.render("list", {lists: allList});
      List.findOne({name: customListName}, function(err, foundlist){
        if (!err) {
          if (!foundlist) {
            //Create a new list
            const list = new List({
              name: customListName,
              items: defaultItems
            });
    
            list.save();
    
            res.redirect("/" + customListName);
    
          }else {
            //Show an existing list
            res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items, tabList: allList});
          }
        }
      });
    
    }
  });

 });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
