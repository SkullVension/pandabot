import { ComponentType, escapeMarkdown, MessageFlags } from "discord.js";

const COMPONENTS_V2_FLAG = MessageFlags.IsComponentsV2;
const MAX_TEXT_LENGTH = 50;

function truncateText(text, maxLength = MAX_TEXT_LENGTH) {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function buildProfileMessage({ target, member, profile, joined, badgeString }) {
  const displayName =
    member?.displayName || target.displayName || target.username;
  const avatarUrl = target.displayAvatarURL({ size: 256 });

  const bioText = profile?.bio
    ? escapeMarkdown(profile.bio)
    : "No bio set yet. (use `/edit-profile` command to edit your profile)";

  const introText = [
    `## ${truncateText(escapeMarkdown(displayName))}`,
    badgeString ? `${badgeString}` : null,
    " ",
    `${truncateText(escapeMarkdown(bioText))}`,
  ]
    .filter(Boolean)
    .join("\n");

  const fieldEntries = [
    profile?.country
      ? {
          name: "Country",
          value: truncateText(escapeMarkdown(profile.country)),
        }
      : null,
    profile?.age
      ? { name: "Age", value: truncateText(`${profile.age}`) }
      : null,
    profile?.stack
      ? { name: "Stack", value: truncateText(escapeMarkdown(profile.stack)) }
      : null,
    profile?.hobbies
      ? {
          name: "Hobbies",
          value: truncateText(escapeMarkdown(profile.hobbies)),
        }
      : null,
  ].filter(Boolean);

  const links = [
    profile?.github
      ? {
          label: truncateText("GitHub"),
          url: profile.github,
        }
      : null,
    profile?.portfolio
      ? {
          label: truncateText("Portfolio"),
          url: profile.portfolio,
        }
      : null,
  ].filter(Boolean);

  const infoText = [
    ...fieldEntries.map((field) => `**${field.name}:** ${field.value}`),
  ].join("\n");

  return {
    content: "",
    flags: COMPONENTS_V2_FLAG,
    components: [
      {
        type: ComponentType.Container,
        accent_color: 0x2b2d31,
        size: 1,
        components: [
          {
            type: ComponentType.Section,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: introText,
              },
            ],
            spacing: 2,
            accessory: {
              type: ComponentType.Thumbnail,
              media: {
                url: avatarUrl,
              },
              description: `${displayName}'s avatar`,
            },
          },
          {
            type: ComponentType.Separator,
            divider: true,
            spacing: 2,
          },
          {
            type: ComponentType.TextDisplay,
            content: infoText,
          },
          ...(links.length
            ? [
                {
                  type: ComponentType.ActionRow,
                  components: links.map((link) => ({
                    type: ComponentType.Button,
                    style: 5,
                    label: link.label,
                    url: link.url,
                  })),
                },
              ]
            : []),
          {
            type: ComponentType.TextDisplay,
            content: `Joined ${joined}`,
          },
        ],
      },
    ],
  };
}

export default buildProfileMessage;
