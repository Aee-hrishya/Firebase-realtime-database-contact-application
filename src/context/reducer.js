//TODO: create contact using all actions

import {
  SET_CONTACT,
  SET_LOADING,
  CONTACT_TO_UPDATE,
  SET_SINGLE_CONTACT
} from "./action.types";

//TODO: use switch case
const reducer = (state, action) => {

  switch (action.type) {
    case SET_CONTACT: return action.payload === null ? {...state, contacts: []}: {...state, contacts: action.payload};
      
    case SET_LOADING: return{...state, isLoading: action.payload};

    case CONTACT_TO_UPDATE: return{
      ...state,
      contactToUpdate:action.payload,
      contactToUpdateKey:action.key //This key is really important as our application will get very large and then we need key to     track the contact  we want to update
    };
  
    case SET_SINGLE_CONTACT: return{
      ...state,
      contact: action.payload
    };

    default: return state;
      
  }
}

export default reducer;