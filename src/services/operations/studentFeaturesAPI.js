import { toast } from "react-hot-toast"

import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiconnector"
import { studentEndpoints } from "../apis"

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;
function loadScript (src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}


export async function buyCourse (token, courses, userDetails, navigate, dispatch) {
    // console.log("buyCourse -> courses",process.env.REACT_APP_BASE_URL)
    const toastId = toast.loading("Please wait while we redirect you to payment gateway", {
      position: "bottom-center",
      autoClose: false,
    });
    try {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
        }
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {courses},{
        Authorization: `Bearer ${token}`,
    })
    if(!orderResponse.data.success){
        toast.error(orderResponse.data.message)
        console.log("buyCourse -> orderResponse", orderResponse)
        toast.dismiss(toastId);
        return
    }
    console.log("buyCourse -> orderResponse", orderResponse)
    const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        currency: orderResponse.data.data.currency,
        amount: orderResponse.data.data.amount,
        order_id: orderResponse.data.data.id,
        name: "Study Hub",
        description: "Thank you for purchasing the course",
        image: rzpLogo,
        prefill: {
            name: userDetails?.firstName + " " + userDetails?.lastName,
            email: userDetails?.email,
        },
        handler: async function (response) {
            console.log("buyCourse -> response", response)
            sendPaymentSuccessEmail(response,orderResponse.data.data.amount,token);
            verifypament(response,courses,token,navigate,dispatch);
        },
        theme: {
            color: "#686CFD",
        },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
        toast.error("Payment Failed");
    });
    toast.dismiss(toastId);

    } catch (error) {
        toast.dismiss(toastId);
        toast.error("Something went wrong");
        console.log("buyCourse -> error", error)
    }
}



async function sendPaymentSuccessEmail (response,amount,token) {
    // const data = {
    //     amount,
    //     paymentId: response.razorpay_payment_id,
    //     orderId: response.razorpay_order_id,
    //     signature: response.razorpay_signature,
    // };
    console.log("amount from sendPaymentSuccessEmail ->",amount);
    const res = await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API,{
        amount,
        paymentId:response.razorpay_payment_id,
        orderId:response.razorpay_order_id,
    }, {
        Authorization: `Bearer ${token}`,
    });
    if (!res.success) {
        console.log(res.message);
        toast.error(res.message);
    }
}

async function verifypament (response,courses,token,navigate,dispatch,) {
    const toastId = toast.loading("Please wait while we verify your payment");
    try{
        // const data = {
        //     amount: response.amount.toString(),
        //     paymentId: response.razorpay_payment_id,
        //     orderId: response.razorpay_order_id,
        //     signature: response.razorpay_signature,
        // };
        const res = await apiConnector("POST", COURSE_VERIFY_API,{
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            courses:courses.courses || courses,
        }, {
            Authorization: `Bearer ${token}`,
        });
        console.log("verifypament -> res", res)
        if (!res.data.success) {
            toast.error(res.message);
            return;
        }

        toast.success("Payment Successfull");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch(err){
        toast.error("Payment Failed");
        console.log(err.message);
    }
    toast.dismiss(toastId);
}















































// import { toast } from "react-hot-toast";
// import { studentEndpoints } from "../apis";
// import { apiConnector } from "../apiconnector";
// import rzpLogo from "../../assets/Logo/rzp_logo.png"
// import { setPaymentLoading } from "../../slices/courseSlice";
// import { resetCart } from "../../slices/cartSlice";


// const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

// function loadScript(src) {
//     return new Promise((resolve) => {
//         const script = document.createElement("script");
//         script.src = src;

//         script.onload = () => {
//             resolve(true);
//         }
//         script.onerror= () =>{
//             resolve(false);
//         }
//         document.body.appendChild(script);
//     })
// }


// export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
//     const toastId = toast.loading("Loading...");
//     try{
//         //load the script
//         const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

//         if(!res) {
//             toast.error("RazorPay SDK failed to load");
//             return;
//         }

//         //initiate the order
//         const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, 
//                                 {courses},
//                                 {
//                                     Authorization: `Bearer ${token}`,
//                                 })

//         if(!orderResponse.data.success) {
//             throw new Error(orderResponse.data.message);
//         }
//         console.log("PRINTING orderResponse", orderResponse);
//         //options
//         const options = {
//             key: process.env.RAZORPAY_KEY,
//             currency: orderResponse.data.message.currency,
//             amount: `${orderResponse.data.message.amount}`,
//             order_id:orderResponse.data.message.id,
//             name:"StudyNotion",
//             description: "Thank You for Purchasing the Course",
//             image:rzpLogo,
//             prefill: {
//                 name:`${userDetails.firstName}`,
//                 email:userDetails.email
//             },
//             handler: function(response) {
//                 //send successful wala mail
//                 sendPaymentSuccessEmail(response, orderResponse.data.message.amount,token );
//                 //verifyPayment
//                 verifyPayment({...response, courses}, token, navigate, dispatch);
//             }
//         }
//         //miss hogya tha 
//         const paymentObject = new window.Razorpay(options);
//         paymentObject.open();
//         paymentObject.on("payment.failed", function(response) {
//             toast.error("oops, payment failed");
//             console.log(response.error);
//         })

//     }
//     catch(error) {
//         console.log("PAYMENT API ERROR.....", error);
//         toast.error("Could not make Payment");
//     }
//     toast.dismiss(toastId);
// }

// async function sendPaymentSuccessEmail(response, amount, token) {
//     try{
//         await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
//             orderId: response.razorpay_order_id,
//             paymentId: response.razorpay_payment_id,
//             amount,
//         },{
//             Authorization: `Bearer ${token}`
//         })
//     }
//     catch(error) {
//         console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
//     }
// }

// //verify payment
// async function verifyPayment(bodyData, token, navigate, dispatch) {
//     const toastId = toast.loading("Verifying Payment....");
//     dispatch(setPaymentLoading(true));
//     try{
//         const response  = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
//             Authorization:`Bearer ${token}`,
//         })

//         if(!response.data.success) {
//             throw new Error(response.data.message);
//         }
//         toast.success("payment Successful, ypou are addded to the course");
//         navigate("/dashboard/enrolled-courses");
//         dispatch(resetCart());
//     }   
//     catch(error) {
//         console.log("PAYMENT VERIFY ERROR....", error);
//         toast.error("Could not verify Payment");
//     }
//     toast.dismiss(toastId);
//     dispatch(setPaymentLoading(false));
// }










// // import { toast } from "react-hot-toast";
// // import { studentEndpoints } from "../apis";
// // import { apiConnector } from "../apiconnector";
// // import rzpLogo from "../../assets/Logo/rzp_logo.png"
// // import { setPaymentLoading } from "../../slices/courseSlice";
// // import { resetCart } from "../../slices/cartSlice";


// // const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

// // function loadScript(src) {
// //     return new Promise((resolve) => {
// //         const script = document.createElement("script");
// //         script.src = src;

// //         script.onload = () => {
// //             resolve(true);
// //         }
// //         script.onerror= () =>{
// //             resolve(false);
// //         }
// //         document.body.appendChild(script);
// //     })
// // }


// // export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
// //     const toastId = toast.loading("Loading...");
// //     try{
// //         //load the script
// //         const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

// //         if(!res) {
// //             toast.error("RazorPay SDK failed to load");
// //             return;
// //         }

// //         //initiate the order
// //         const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, 
// //                                 {courses},
// //                                 {
// //                                     Authorization: `Bearer ${token}`,
// //                                 })

// //         if(!orderResponse.data.success) {
// //             throw new Error(orderResponse.data.message);
// //         }
// //         console.log("PRINTING orderResponse", orderResponse);
// //         //options
// //         const options = {
// //             key: process.env.RAZORPAY_KEY,
// //             currency: orderResponse.data.message.currency,
// //             amount: `${orderResponse.data.message.amount}`,
// //             order_id:orderResponse.data.message.id,
// //             name:"StudyNotion",
// //             description: "Thank You for Purchasing the Course",
// //             image:rzpLogo,
// //             prefill: {
// //                 name:`${userDetails.firstName}`,
// //                 email:userDetails.email
// //             },
// //             handler: function(response) {
// //                 //send successful wala mail
// //                 sendPaymentSuccessEmail(response, orderResponse.data.message.amount,token );
// //                 //verifyPayment
// //                 verifyPayment({...response, courses}, token, navigate, dispatch);
// //             }
// //         }
// //         //miss hogya tha 
// //         const paymentObject = new window.Razorpay(options);
// //         paymentObject.open();
// //         paymentObject.on("payment.failed", function(response) {
// //             toast.error("oops, payment failed");
// //             console.log(response.error);
// //         })

// //     }
// //     catch(error) {
// //         console.log("PAYMENT API ERROR.....", error);
// //         toast.error("Could not make Payment");
// //     }
// //     toast.dismiss(toastId);
// // }

// // async function sendPaymentSuccessEmail(response, amount, token) {
// //     try{
// //         await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
// //             orderId: response.razorpay_order_id,
// //             paymentId: response.razorpay_payment_id,
// //             amount,
// //         },{
// //             Authorization: `Bearer ${token}`
// //         })
// //     }
// //     catch(error) {
// //         console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
// //     }
// // }

// // //verify payment
// // async function verifyPayment(bodyData, token, navigate, dispatch) {
// //     const toastId = toast.loading("Verifying Payment....");
// //     dispatch(setPaymentLoading(true));
// //     try{
// //         const response  = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
// //             Authorization:`Bearer ${token}`,
// //         })

// //         if(!response.data.success) {
// //             throw new Error(response.data.message);
// //         }
// //         toast.success("payment Successful, ypou are addded to the course");
// //         navigate("/dashboard/enrolled-courses");
// //         dispatch(resetCart());
// //     }   
// //     catch(error) {
// //         console.log("PAYMENT VERIFY ERROR....", error);
// //         toast.error("Could not verify Payment");
// //     }
// //     toast.dismiss(toastId);
// //     dispatch(setPaymentLoading(false));
// // }