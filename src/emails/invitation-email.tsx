import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface inviteEmailProps {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}

function invitationEmail({
  email,
  inviteLink,
  invitedByEmail,
  invitedByUsername,
  teamName,
}: inviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>You&apos;ve been invited to join ${teamName}</Preview>
        <Container style={container}>
          <Section style={content}>
            <Heading>You&apos;re invited!</Heading>
            <Text style={paragraph}>
              Join {teamName} and start collaborating
            </Text>
            <Text style={paragraph}>
              Hi there, <strong>{invitedByUsername}</strong> ({invitedByEmail})
              has invited you to join <strong>{teamName}</strong> on our
              platform.
            </Text>
            <Text style={paragraph}>
              Accept this invitation to start collaborating with your team
              members and access all the tools and resources available in your
              organization.
            </Text>
            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>
            <Text style={smallParagraph}>
              If you did not request this, please ignore this email.
            </Text>
          </Section>
          <Section style={sectionInfo}>
            <Text style={additionalInfo}>
              <strong>Organization:</strong> {teamName}
            </Text>
            <Text style={additionalInfo}>
              <strong>Invited by:</strong> {invitedByUsername} ({invitedByEmail}
              )
            </Text>
            <Text style={additionalInfo}>
              <strong>Your email: </strong>
              {email}
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

export default invitationEmail;

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
  width: "300px",
  margin: "0 auto",
  fontWeight: 600,
  fontSize: "16px",
  border: "1px solid",
  color: "#fff",
  backgroundColor: "salmon",
  textDecoration: "none",
};

const sectionInfo = {
  marginBottom: "24px",
  padding: "20px",
  borderTop: "1px solid #e0e0e0",
  paddingTop: "24px",
};

const additionalInfo = {
  margin: "0",
  marginBottom: "8px",
  fontSize: "14px",
  color: "#666",
};
