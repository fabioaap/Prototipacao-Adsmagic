import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  buildWhatsAppTrackedMessage,
  decodeWhatsAppProtocol,
  encodeWhatsAppProtocol,
  generateWhatsAppProtocol,
  stripInvisibleProtocolChars,
  stripWhatsAppProtocol,
} from "../../_shared/whatsapp-protocol.ts";

Deno.test("whatsapp-protocol: should encode and decode protocol", () => {
  const protocol = "WA-ABC123-XYZ789";
  const token = encodeWhatsAppProtocol(protocol);

  assertNotEquals(token.length, 0);
  assertEquals(token.includes("\u2063"), false);
  assertEquals(decodeWhatsAppProtocol(token), protocol);
});

Deno.test("whatsapp-protocol: should build tracked message with embedded token and strip token", () => {
  const protocol = generateWhatsAppProtocol();
  const message = buildWhatsAppTrackedMessage(
    "Ola, vim pelo anuncio",
    protocol,
  );

  assertEquals(message.startsWith("O"), true);
  assertEquals(decodeWhatsAppProtocol(message), protocol);
  assertEquals(stripWhatsAppProtocol(message), "Ola, vim pelo anuncio");
});

Deno.test("whatsapp-protocol: should return null for invalid token", () => {
  const invalidMessage = "\u200B\u200C\u200Dmensagem-sem-protocolo";
  assertEquals(decodeWhatsAppProtocol(invalidMessage), null);
});

Deno.test("whatsapp-protocol: should decode protocol from tracked message body", () => {
  const protocol = "WA-MM5K3VJV-HJK15RBP";
  const trackedMessage = buildWhatsAppTrackedMessage("Teste", protocol);

  assertEquals(decodeWhatsAppProtocol(trackedMessage), protocol);
  assertEquals(stripWhatsAppProtocol(trackedMessage), "Teste");
});

Deno.test("whatsapp-protocol: should fallback to greeting when message is empty", () => {
  const protocol = "WA-MM5K3VJV-HJK15RBP";
  const trackedMessage = buildWhatsAppTrackedMessage("", protocol, {
    timezone: "America/Sao_Paulo",
    now: new Date("2026-02-28T12:00:00.000Z"),
  });

  assertEquals(decodeWhatsAppProtocol(trackedMessage), protocol);
  assertEquals(stripWhatsAppProtocol(trackedMessage), "Ola, bom dia");
});

Deno.test("whatsapp-protocol: should decode protocol even with trailing invisible noise", () => {
  const protocol = "WA-MM6GIL9G-OX86NCEK";
  const token = encodeWhatsAppProtocol(protocol);
  const trailingNoise = "\u2060\u200D\u200B\u200B\u200B\u2060\u200C\u200C\u200D\u200D";
  const contaminatedMessage = `O${token}${trailingNoise}la`;

  assertEquals(decodeWhatsAppProtocol(contaminatedMessage), protocol);
  assertEquals(stripWhatsAppProtocol(contaminatedMessage), "Ola");
});

Deno.test("whatsapp-protocol: should sanitize pre-existing invisible chars before embedding token", () => {
  const protocol = "WA-MM6GIL9G-OX86NCEK";
  const preexistingNoise = "\u2060\u200D\u200B\u200B\u200B\u2060\u200C\u200C\u200D\u200D";
  const trackedMessage = buildWhatsAppTrackedMessage(`O${preexistingNoise}la`, protocol);

  assertEquals(decodeWhatsAppProtocol(trackedMessage), protocol);
  assertEquals(stripWhatsAppProtocol(trackedMessage), "Ola");
});

Deno.test("whatsapp-protocol: should strip all reserved invisible chars", () => {
  const contaminated = "A\u200BB\u200CC\u200DD\u2060E";
  assertEquals(stripInvisibleProtocolChars(contaminated), "ABCDE");
});
