import { combineReducers } from "redux";
import authReducer from '../slices/authSlice.js';
import profileReducer  from '../slices/profileSlice.js';
import cartReducer from '../slices/cartSlice.js';
const rootReducer = combineReducers({
    auth:authReducer,
    profile: profileReducer,
    cart:cartReducer,
})
export default rootReducer;