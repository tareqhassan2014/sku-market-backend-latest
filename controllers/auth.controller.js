const catchAsyncErrors = require("../lib/catchAsyncErrors");
const { sendEmail } = require("../lib/nodemailer");
const User = require("../models/user.model");
const AppError = require("../util/appError");
const crypto = require("crypto");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const verifyEmailHTML = require("../util/template/verifyEmailHTML");
const activationEmailHTML = require("../util/template/activationEmailHTML");
const { bucket, bucketName, bucketUpload } = require("../lib/googleBucket");
const BillingInfo = require("../models/billingInfo.model");
const resetPasswordEmailHTML = require("../util/template/resetPasswordEmailHTML");

// create new user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, companyName, email, password } = req.body;

    const user = await User.create({
        name,
        companyName,
        email,
        password,
    });

    // create access token
    const token = user.getJwtToken();

    // get verification token
    const verificationToken = await user.getEmailVerifyToken();

    await BillingInfo.create({ userId: user._id, addresses: [] });
    await user.save({ validateBeforeSave: false });

    // create verification url
    const verifyUrl = `${process.env.CLIENT_URL}/auth/email/verify/${verificationToken}`;
    const html = verifyEmailHTML(verifyUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "SKU Market Email Verification",
            html,
        });
    } catch (error) {
        user.emailVerifyToken = undefined;
        user.emailVerifyTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
    }

    res.status(201).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            companyName: user.companyName,
            email: user.email,
            role: user.role,
            docs: user.docs,
            token: token,
            createdAt: user.createdAt,
        },
    });
});

// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email and password is entered by user
    if (!email || !password) {
        return next(new AppError("Please enter email and password", 400));
    }

    // finding user in database
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("Invalid Email or Password", 401));
    }

    // check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new AppError("Invalid Email or Password", 401));
    }

    // check if the user is active or not
    if (user.status !== "active" && user.isProfileComplete) {
        return next(new AppError("This account isn't active yet", 401));
    }

    // create token
    const token = user.getJwtToken();

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            companyName: user.companyName,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            state: user.state,
            phone: user.phone,
            location: user?.location,
            address: user.address,
            country: user.country,
            zipCode: user.zipCode,
            city: user.city,
            about: user.about,
            avatar: user?.avatar,
            cover: user?.cover,
            isEmailVerified: user?.isEmailVerified,
            isWhatsappVerified: user?.isWhatsappVerified,
            agreement: user?.agreement,
            seller_type: user?.seller_type,
            docs: user?.docs,
            delivery_method: user?.delivery_method,
            isProfileComplete: user?.isProfileComplete,
            token,
        },
    });
});
// User share profile publicaly
exports.getUserShareProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ _id: req.body.userid });

    if (!user) return next(new AppError("Sorry user not found", 400));
    return res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            companyName: user.companyName,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            state: user.state,
            phone: user.phone,
            location: user?.location,
            address: user.address,
            country: user.country,
            zipCode: user.zipCode,
            city: user.city,
            about: user.about,
            avatar: user?.avatar,
            cover: user?.cover,
            isEmailVerified: user?.isEmailVerified,
            isWhatsappVerified: user?.isWhatsappVerified,
            agreement: user?.agreement,
            seller_type: user?.seller_type,
            docs: user?.docs,
            delivery_method: user?.delivery_method,
            isProfileComplete: user?.isProfileComplete,
        },
    });
});
// logout user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "User logged out",
    });
});

// get currently logged in user details
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            companyName: user.companyName,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            state: user.state,
            phone: user.phone,
            location: user?.location,
            address: user.address,
            country: user.country,
            zipCode: user.zipCode,
            city: user.city,
            about: user.about,
            avatar: user?.avatar,
            cover: user?.cover,
            isEmailVerified: user?.isEmailVerified,
            isWhatsappVerified: user?.isWhatsappVerified,
            agreement: user?.agreement,
            seller_type: user?.seller_type,
            docs: user?.docs,
            delivery_method: user?.delivery_method,
            isProfileComplete: user?.isProfileComplete,
        },
    });
});

// update / change password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");

    // check if previous old password
    if (!req.body.oldPassword) {
        return next(new AppError("Please enter old password", 400));
    }

    // check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new AppError("Old password is incorrect", 400));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError("User not found with this email", 404));
    }

    // get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // create reset password url
    const resetUrl = `${process.env.CLIENT_URL}/password/reset/${resetToken}`;

    // forget password email template
    const html = resetPasswordEmailHTML(resetUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "SKU Market Password Recovery",
            html,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`,
        });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError(error.message, 500));
    }
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // hash url token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new AppError(
                "Password reset token is invalid or has been expired",
                400
            )
        );
    }

    if (
        req.body.password !== req.body.confirmPassword ||
        !req.body.password ||
        !req.body.confirmPassword
    ) {
        return next(new AppError("Password does not match", 400));
    }

    // setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // create token
    const token = user.getJwtToken();

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        },
        message: "Password updated successfully",
    });
});

// verify email
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;

    const emailVerifyToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
        return next(new AppError("Email is already verified", 400));
    }

    if (user.emailVerifyTokenExpire < Date.now()) {
        return next(new AppError("Verification token has been expired", 400));
    }

    if (user.emailVerifyToken !== emailVerifyToken) {
        return next(new AppError("Verification token is invalid", 400));
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Email verified successfully",
    });
});

//send email verification token
exports.sendEmailVerificationToken = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.user._id);

        // get verification token
        const token = await user.getEmailVerifyToken();

        await user.save({ validateBeforeSave: false });

        // create verification url
        const verifyUrl = `${process.env.CLIENT_URL}/auth/email/verify/${token}`;

        const html = verifyEmailHTML(verifyUrl);

        try {
            await sendEmail({
                email: user.email,
                subject: "SKU Market Email Verification",
                html,
            });

            res.status(200).json({
                success: true,
                message: `Email sent to: ${user.email}`,
            });
        } catch (error) {
            user.emailVerifyToken = undefined;
            user.emailVerifyTokenExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError(error.message, 500));
        }
    }
);

// send OTP to user phone
exports.sendOTP = catchAsyncErrors(async (req, res, next) => {
    const { phone } = req.body;
    const user = await User.findById(req.user._id);

    // get OTP
    const otp = await user.getOTP();

    await user.save({ validateBeforeSave: false });

    try {
        // ------------------- Have to send sms --------------------
        // await sendSMS({
        //   to: phone,
        //   message: `Your OTP is ${otp}`,
        // });

        res.status(200).json({
            success: true,
            message: `OTP sent to: ${phone}`,
        });
    } catch (error) {
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError(error.message, 500));
    }
});

// verify OTP
exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user.otp) {
        return next(new AppError("Verification failed.", 400));
    }

    const isVerified = await user.verifyOTP(req.body.otp);
    if (!isVerified) {
        return next(new AppError("Invalid OTP", 400));
    }

    if (user.otpExpire < Date.now()) {
        return next(new AppError("OTP has been expired", 400));
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isWhatsappVerified = true;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "OTP verified successfully",
    });
});

// set refresh token
exports.setRefreshToken = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // get refresh token
    const refreshToken = user.getRefreshToken();

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        refreshToken,
    });
});

// update me details
exports.updateMe = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        country: req.body.country,
        city: req.body.city,
        zipCode: req.body.zipCode,
        state: req.body.state,
        about: req.body.about,
    };

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
    });

    // find those users who's country is same as empty and update it with new country name "test"
    // await User.updateMany(
    //     { companyName: "" },
    //     { $set: { companyName: "test" } },
    //     { multi: true }
    // );

    res.status(200).json({
        success: true,
        user,
    });
});

// Update Avatar
exports.updateAvatar = catchAsyncErrors(async (req, res, next) => {
    const fileName = req.file.filename;
    const filePath = `./upload/avatar/${fileName}`;

    const user = await User.findById(req.user._id);

    // Delete previous image from bucket
    const prevUrl = user.avatar.split(`${bucketName}/`)[1];
    const deletePrevImg = async () => {
        await bucket.file(prevUrl).delete();
    };
    if (prevUrl) deletePrevImg().catch(console.error);

    // Uploads a local file to the bucket
    const { url } = await bucketUpload(filePath, `avatar/${fileName}`);

    // Deleting local file
    await fs.unlinkSync(filePath);

    // Update ImagePath to the database
    user.avatar = url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: url,
    });
});

// Update Cover
exports.updateCover = catchAsyncErrors(async (req, res, next) => {
    const fileName = req.file.filename;
    const filePath = `./upload/cover/${fileName}`;
    const user = await User.findById(req.user._id);

    // Delete previous image from bucket
    const prevUrl = user.cover.split(`${bucketName}/`)[1];
    const deletePrevImg = async () => {
        await bucket.file(prevUrl).delete();
    };
    if (prevUrl) deletePrevImg().catch(console.error);

    // Uploads a local file to the bucket
    const { url } = await bucketUpload(filePath, `cover/${fileName}`);

    // Deleting local file
    await fs.unlinkSync(filePath);

    // Update ImagePath to the database
    user.cover = url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Cover image updated successfully",
        data: url,
    });
});

// Update Agreement Accepting
exports.updateAgreement = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { type, seller_type } = req.body;

    user.agreement[type] = true;

    if (seller_type) {
        user.seller_type = seller_type;
    }

    user.save({ validateBeforeSave: true });

    res.status(200).json({
        success: true,
        message: "Agreement updated successfully",
    });
});

// Upload Docs
exports.uploadDocs = catchAsyncErrors(async (req, res, next) => {
    const field = req.params.field;
    const fileName = req.file.filename;
    const filePath = `./upload/docs/${fileName}`;

    const user = await User.findById(req.user._id);

    // Uploads a local file to the bucket
    const { url } = await bucketUpload(filePath, `docs/${fileName}`);

    // Deleting local file
    await fs.unlinkSync(filePath);

    // Update to the database
    user.docs[field].url = url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Document Submitted successfully",
        data: url,
    });
});

// Update User Docs Information
exports.updateDocsInfo = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const { commercial, vat, national, bank, courier, delivery_method } =
        req.body;
    const result = await User.updateOne(
        { _id: userId },
        {
            $set: {
                "docs.commercial.value": commercial,
                "docs.vat.value": vat,
                "docs.national.value": national,
                "docs.bank.value": bank,
                "docs.courier.value": courier,
                "docs.other.value": "",
                delivery_method: delivery_method,
            },
        },
        { runValidators: false }
    );
    console.log(result);

    res.status(200).json({
        success: true,
        message: "Business Info added successfully",
        data: result,
    });
});

// Make Profile Complete
exports.completeProfile = catchAsyncErrors(async (req, res, next) => {
    const result = await User.updateOne(
        { _id: req.user._id },
        { isProfileComplete: true },
        { runValidators: true }
    );
    res.status(200).json({
        success: true,
        message: "Registration Process completed",
    });
});

// Delete submitted Docs
exports.deleteDocs = catchAsyncErrors(async (req, res, next) => {
    const fieldName = req.body.fieldName;
    const user = await User.findById(req.user._id);

    // Delete previous doc from bucket
    const prevUrl = user.docs[fieldName]?.url?.split(`${bucketName}/`)[1];
    const deletePrevDoc = async () => {
        await bucket.file(prevUrl).delete();
    };
    if (prevUrl) deletePrevDoc().catch(console.error);

    // Update to the database
    user.docs[fieldName].url = "";
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Deleted successfully",
    });
});

// Make active an user
exports.activateUser = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.body;
    const adminId = req.user._id;

    const admin = await User.findById(adminId);

    if (admin.role !== "admin") {
        return next(
            new AppError("You are not authorized to make user active", 401)
        );
    }

    const user = await User.findById(userId);

    user.status = "active";
    await user.save();

    const html = activationEmailHTML();

    try {
        await sendEmail({
            email: user.email,
            subject: "SKU Markets account is activated",
            html,
        });
    } catch (error) {
        console.log(error);
    }

    res.status(200).json({
        success: true,
        message: "User activated successfully",
    });
});
