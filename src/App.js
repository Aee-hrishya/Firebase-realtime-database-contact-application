import React, { useReducer, useEffect } from "react";

import { Container, Col, Row } from "reactstrap";

// react-router-dom3
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// react toastify stuffs
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// bootstrap css
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// firebase stuffs
//TODO: import firebase config and firebase database
import { firebaseConfig } from "./utils/config";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";


// components
import AddContact from "./pages/AddContact";
import Contacts from "./pages/Contacts";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import ViewContact from "./pages/ViewContact";
import PageNotFound from "./pages/PageNotFound";

// context api stuffs
//TODO: import reducers and contexts
import reducer from "./context/reducer";
import ContactContext from "./context/Context";
import { SET_CONTACT, SET_LOADING } from "./context/action.types";

//initlizeing firebase app with the firebase config which are in ./utils/firebaseConfig
//TODO: initialize FIREBASE
firebase.initializeApp(firebaseConfig);

// first state to provide in react reducer
const initialState = {
  contacts: [],
  contact: {},
  contactToUpdate: null,
  contactToUpdateKey: null,
  isLoading: false
};

const App = () => {


  const [state, dispatch] = useReducer(reducer, initialState);

  // will get contacts from firebase and set it on state contacts array
  const getContacts = async () => {
    // load existing data
    dispatch({
      type:SET_LOADING, //This will show a spinner when data is loading
      payload: true
    });

    //Now we are getting the info from the database
    const contactsRef = await firebase.database().ref("/contacts");

    //Firing the onValue event of firebase to get the data from the firebase database
    contactsRef.on("value", snapshot => {
      dispatch({
        type: SET_CONTACT,
        payload: snapshot.val()
      });

      dispatch({
        type:SET_LOADING, //This will turn of the spinner after the contacts are loaded
        payload: false
      }); 

    });
  };

  // getting contact  when component did mount
  useEffect(() => {
    //FIXME: call methods if needed
    getContacts();
  }, []);

  return (
    <Router>
      <ContactContext.Provider value={{state, dispatch}}>
        <ToastContainer />
        <Header />
        <Container>
          <Routes>
            <Route path="/contact/add" element={<AddContact />} />
            <Route path="/contact/view" element={<ViewContact />} />
            <Route path="/" element={<Contacts />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Container>

        <Footer />
      </ContactContext.Provider>
    </Router>
  );
};

export default App;
