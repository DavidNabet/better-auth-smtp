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
} from "@react-email/components";
import * as React from "react";

interface verificationEmailProps {
  name: string;
  magicLink: string;
}

function signInMagicLink({ name, magicLink }: verificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading>Log in with this magic link</Heading>
            <Text style={paragraph}>Hello {name}</Text>
            <Text style={paragraph}>
              Thank you for registering with us. Please click the button below
              to continue.
            </Text>
            <Text style={paragraph}>
              This link will be valid only for an hour.
            </Text>
            <Button style={button} href={magicLink}>
              👉 Click here to sign in 👈
            </Button>
            <Text style={smallParagraph}>
              If you did not request this, please ignore this email.
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

export default signInMagicLink;

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

const button = {
  display: "block",
  textAlign: "center" as const,
  padding: "14px 20px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "16px",
  color: "salmon",
  textDecoration: "none",
};
