import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import signInMagicLink from "@/emails/signin-magiclink";
import signInOTPMail from "@/emails/signin-otp-mail";
import invitationEmail from "@/emails/invitation-email";

const emailFrom = process.env.EMAIL_FROM ?? "";
const passwordForm = process.env.EMAIL_PASSWORD ?? "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: emailFrom,
    pass: passwordForm,
  },
});

export const sendMagicLinkforLogin = async (
  name: string,
  email: string,
  url: string,
) => {
  // const name = email.split("@")[0];
  const magicLinkHTML = await render(signInMagicLink({ name, magicLink: url }));

  await transporter.sendMail({
    from: "<support@smtp.com>",
    to: email,
    subject: "Verify your email address",
    html: magicLinkHTML,
  });
};

export const sendOTPforLogin = async (
  name: string,
  email: string,
  otp: string,
) => {
  const signInOTPEmailHtml = await render(signInOTPMail({ name, otp }));

  await transporter.sendMail({
    from: "<support@smtp.com>",
    to: email,
    subject: "Two Factor Authentication",
    html: signInOTPEmailHtml,
  });
};

export const sendInviteEmail = async (
  email: string,
  invitedByUsername: string,
  invitedByEmail: string,
  teamName: string,
  url: string,
) => {
  const inviteEmailHtml = await render(
    invitationEmail({
      email,
      invitedByEmail,
      invitedByUsername,
      teamName,
      inviteLink: url,
    }),
  );

  await transporter.sendMail({
    from: "<support@smtp.com>",
    to: email,
    subject: "You've been invited to join our organization",
    html: inviteEmailHtml,
  });
};
