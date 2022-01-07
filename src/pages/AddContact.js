// https://firebase.google.com/docs/storage/web/upload-files#full_example
// https://www.npmjs.com/package/browser-image-resizer#asyncawait

import React, { useState, useContext, useEffect } from "react";
import firebase from "firebase/app";

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col
} from "reactstrap";

// to compress image before uploading to the server
import { readAndCompressImage } from "browser-image-resizer";

// configs for image resizing
// Adding image configurations
import { imageConfig } from "../utils/config";

import { MdAddCircleOutline } from "react-icons/md";

//For generating random ID's
import { v4 } from "uuid";

// context stuffs
import ContactContext from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";


const AddContact = () => {


  // destructuring state and dispatch from context state
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;

  // useNavigate hook from react router dom to send to different page
  const navigate = useNavigate();


  // simple state of all component
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  // when there is the contact to update in the Context state
  // then setting state with the value of the contact
  // will change only when the contact to update changes
  useEffect(() => {

    //Basically if contactToUpdate has a value we preload it everytime there is a change in the contactToUpdate
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setDownloadUrl(contactToUpdate.picture);

      // also setting is updated to true to make the update action instead the addContact action
      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  // To upload image to firebase and then set the the image link in the state of the app
  const imagePicker = async e => {
    // TODO: upload image and set D-URL to state
    try {

      const file = e.target.files[0]; //getting the files from the e.target

      //This is the info that we need to pass as metadata whenever we are working with photos, mp3, mp4 or else firebase takes the default data that it gets / refer firebase docs
      var metadata = {
        contentType: file.type
      }

      //now we use readAndCompressImage to compress our image
      let resizedImage = await readAndCompressImage(file, imageConfig);

      /****************************************************************************************************************************** */
      //We use the below methods to store images or mp3 or mp4 into the firebase storage
      // Here we have everything related to the firebase docs and this remains the same only the file names change

      //Now below we will be configuring the upload task, refer firebase docs for this everything is mentioned there
      const storageRef = await firebase.storage().ref(); //We get this from firebase storage where we have the reference
      var uploadTask = storageRef
        .child("images/" + file.name)
        .put(resizedImage, metadata); //All these methods are there in firebase docs

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {

          setIsUploading(true); //Changing this state to true as we want to show the spinner logo till the image is uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 //this is all in the firebase docs we calculate the percentage of progress 

          //To display the errors when the file is uploading 
          switch (snapshot.state) {

            case firebase.storage.TaskState.PAUSED:
              setIsUploading(false);
              console.log('Upload is paused');
              break;

            case firebase.storage.TaskState.RUNNING:
              console.log('Upload is running');
              break;
          }

          // Below we check whether the uploading is done and if done then we want to display certain message
          if (progress == 100) {
            setIsUploading(false);
            toast("Uploaded", {
              type: "success"
            });
          }

        },
        error => {
          toast("something went wrong in the state change", {
            type: "error"
          });
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref
            .getDownloadURL().then((downloadURL) => {
              setDownloadUrl(downloadURL); //setting the state to download url which we get
            })
            .catch(error => console.log(error));
        }

      );
    }
    /*********************************************************************************************************************** */
    catch (error) {
      console.error(error);
      toast("Something went wrong", {
        type: "error"
      });
    }
  };

  // setting contact to firebase realtime DB
  const addContact = async () => {
    //TODO: add contact method
    try {
      //everything we do below is in firebase realtime database docs
      //Here we grab the reference of the origin database and then we create the contacts inside it and then we set the object inside it
      firebase
        .database()
        .ref("contacts/" + v4())
        .set({
          name,
          email,
          phoneNumber,
          address,
          picture: downloadUrl,
          star
        });
    } catch (error) {
      console.log(error);
    }
  };

  // to handle update the contact when there is contact in state and the user had came from clicking the contact update icon
  const updateContact = async () => {
    //TODO: update contact method
    try {
      //refer firebase docs. here we grab the reference of contacts(this time this wont be created as we already have one we just grab it) and then we get the contactToUpdateKey and then we just need to set the information again
      firebase
        .database()
        .ref("contacts/" + contactToUpdateKey)
        .set({
          name,
          email,
          phoneNumber,
          address,
          picture: downloadUrl,
          star
        });
    } catch (error) {
      console.log(error);
      toast("Oppss..", { type: "error" });
    }
  };

  // firing when the user click on submit button or the form has been submitted
  const handleSubmit = e => {
    e.preventDefault();

    // isUpdate wll be true when the user came to update the contact
    // when their is contact then updating and when no contact to update then adding contact
    // set isUpdate value
    isUpdate ? updateContact() : addContact();
    toast("success", {type:"success"});
    // to handle the bug when the user visits again to add contact directly by visiting the link
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null
    });

    // after adding/updating contact then sending to the contacts
    // also sending when their are any errors
    navigate("/");
  };

  // return the spinner when the image has been added in the storage
  // showing the update / add contact based on the  state
  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md="6" className="offset-md-3 p-2">
          <Form onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div>
                  <label htmlFor="imagepicker" className="">
                    <img src={downloadUrl} alt="" className="profile" />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={imagePicker}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <FormGroup>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="address"
              />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  onChange={() => {
                    setStar(!star);
                  }}
                  checked={star}
                />{" "}
                <span className="text-right">Mark as Star</span>
              </Label>
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase"
            >
              {isUpdate ? "Update Contact" : "Add Contact"} {/*if this vlaue is true then display the update contact else display the Add Contact */}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddContact;
