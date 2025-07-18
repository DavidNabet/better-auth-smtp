import {
  Html,
  Img,
  Link,
  Section,
  Text,
  Head,
  Heading,
  Container,
  Body,
  Button,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface SignInOTPMailProps {
  name: string;
  otp: string;
}

function signInOTPMail({ name, otp }: SignInOTPMailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your One-Time Password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading>Your One-Time Password</Heading>
            <Text style={paragraph}>Hi {name}</Text>
            <Text style={paragraph}>
              This OTP is valid for the next 10 minutes. Please do not share
              this code with anyone.
            </Text>
            <Section style={codeContainer}>
              <Text style={code}>{otp}</Text>
            </Section>
            <Text style={smallParagraph}>
              If you did not request this code, please secure your account
              immediately by changing your password.
            </Text>
          </Section>
          <Section style={footer}>
            <Text>&copy; {new Date().getFullYear()} All right reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default signInOTPMail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue',
};

const container = {
  maxWidth: "600px",
  margin: "20px auto",
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
};

const content = {
  padding: "20px",
};

const paragraph = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "26px",
};

const smallParagraph = {
  fontStyle: "italic",
  color: "#666",
  fontSize: "12px",
  lineHeight: "18px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};
const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "monospace",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
};
