//this is a wrapper for all request there are two ways
//1. Promise 2. try catch

//1st way : Promis

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = () => {};
// const asyncHandler = (fn) => {()=>{}};
// const asyncHandler = (fn) => {async()=>{}};
// const asyncHandler = () =>async()=> {};
// 2nd way : try catch
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(re, res, next);
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
