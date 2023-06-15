const express = require('express')
const app = express()
var ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const _ = require('lodash');

const PORT = 3000


const dbUrl = "mongodb+srv://username:pass@cluster0.io2eaiy.mongodb.net/todolistDB";

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set('view engine', 'ejs');


mongoose.connect(dbUrl);

const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);


const item1 = new Item({
  name: 'Welcome to your todolist'
})

const item2 = new Item({
  name: 'Hit the + button to add a new item'
})

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
})

const defaultItems = [item1, item2, item3];

const listScheme = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('list', listScheme); //Custom Name List Model








app.get('/', (req, res) => {

  Item.find({}).then((foundItems) => {
    console.log(foundItems);
    if (foundItems.length == 0) {

      Item.insertMany(defaultItems).then(function () {
        console.log("items Successfully Added");
      }).catch(function (err) {
        console.log(err);
      })

      res.redirect('/')

    }

    // Add to DB
    else {
      res.render('list', { listTitle: "Today", newListItems: foundItems });
    }
  }).catch((err) => {
    console.log(err);
  })
})



app.get('/:customListName', (req, res) => { //custom Route

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then(function (foundList) {

    if (!foundList) {

      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();

      res.redirect('/' + customListName);
    }
    else {
      res.render('list', { listTitle: foundList.name, newListItems: foundList.items })
    }
  }).catch((err) => {
    console.log(err);
  })

})








app.post('/', (req, res) => { //root route

  var itemName = req.body.newItem;
  var listName = req.body.list;

  const item = new Item(
    { name: itemName }
  )

  if (listName == 'Today') {
    item.save();

    res.redirect('/')

  } else {

    List.findOne({ name: listName }).then((foundList) => {

      foundList.items.push(item);

      foundList.save();
      res.redirect('/' + listName);
    }).catch((err) => {
      console.log(err);
    })

  }



})


app.post('/delete', (req, res) => {

  const checkedItems = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {

    Item.findByIdAndRemove(checkedItems).then(function () {

      console.log("Deleted Successfully");

      res.redirect('/');

    }).catch((err) => {
      console.log(err);
    })

  } else {

    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItems } } }).then(function () {

      res.redirect('/' + listName);

    }).catch((err) => {
      console.log(err);
    })

  }



})




app.listen(process.env.PORT||PORT, () => {
  console.log(` app listening on port ${PORT}`)
})

