import { Box, Text, Button } from "@skynexui/components";
import { useRouter } from "next/router";

export function Header() {
  const router = useRouter();

  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          onClick={() => {
            sessionStorage.removeItem("userData");
            router.push("/");
          }}
        />
      </Box>
    </>
  );
}
