import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

interface cancelInvitationProps {
  invitationEmail: string;
  invitationName: string;
  organizationName: string;
  cancelledBy: string;
}

function cancelInvitation({
  invitationEmail,
  invitationName,
  organizationName,
  cancelledBy,
}: cancelInvitationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Someone cancel your invitation !</Preview>
        <Container style={container}>
          <Section style={content}>
            <Heading>You&apos;re canceled {invitationName}!</Heading>
            <Text style={paragraph}>
              Hi there, the admin cancelled your invitation to join the
              organization {organizationName} on our platform.
            </Text>
          </Section>
          <Section style={sectionInfo}>
            <Text style={additionalInfo}>
              <strong>Organization:</strong> {organizationName}
            </Text>
            <Text style={additionalInfo}>
              <strong>Cancelled by:</strong> {cancelledBy}
            </Text>
            <Text style={additionalInfo}>
              <strong>Your email: </strong>
              {invitationEmail}
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

export default cancelInvitation;

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

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
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
