import Link from "next/link";
import { Box, Container, Grid, Typography, Stack, Button, Link as MuiLink } from "@mui/material";
import { FaDiscord, FaInstagram, FaTwitter } from "react-icons/fa";
import { RiNextjsFill } from "react-icons/ri";
import { SiKofi, SiMui, SiTailwindcss } from "react-icons/si";

const navSections = [
  {
    title: "Explore",
    links: [
      { label: "Phasmo Tourney series", href: "/phasmotourney-series" },
      { label: "Posts & updates", href: "/posts" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Suggestions", href: "/suggestions" },
      { label: "Style check", href: "/style-check" },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "The Lair of Evil Discord",
        href: "https://discord.gg/xB9mpZfbq3",
        external: true,
      },
      {
        label: "Phasmo Tourney Discord",
        href: "https://discord.gg/r9WT8RUPxn",
        external: true,
      },
      { label: "Profile", href: "/profile" },
    ],
  },
];

const socialLinks = [
  {
    icon: <FaTwitter />,
    label: "Twitter",
    href: "https://twitter.com/dukesenior",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/dukesenior22",
  },
  {
    icon: <FaDiscord />,
    label: "Discord",
    href: "https://discord.gg/xB9mpZfbq3",
  },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        mt: "auto",
        py: 5,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          <Grid item xs={12} lg={4}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              The Lair of Evil
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tools, event dashboards, and community resources powering the
              Phasmo Tourney project and the DukeSenior community.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" sx={{ mb: 2 }}>
              <Button
                href="https://ko-fi.com/dukesenior"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="warning"
                startIcon={<SiKofi />}
                sx={{
                  textTransform: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Support on Ko-Fi
              </Button>
              <Typography variant="caption" color="text.secondary">
                &copy; {new Date().getFullYear()} DukeSenior
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <RiNextjsFill size={16} /> Next.js
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SiMui size={14} /> MUI
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SiTailwindcss size={14} /> Tailwind
              </Typography>
            </Stack>
          </Grid>

          {navSections.map((section) => (
            <Grid item xs={6} md={4} lg={2} key={section.title}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight={600}
                sx={{ mb: 2, display: "block" }}
              >
                {section.title}
              </Typography>
              <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.href}>
                    {link.external ? (
                      <MuiLink
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="text.primary"
                        underline="hover"
                        sx={{
                          fontSize: "0.875rem",
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {link.label}
                      </MuiLink>
                    ) : (
                      <MuiLink
                        component={Link}
                        href={link.href}
                        color="text.primary"
                        underline="hover"
                        sx={{
                          fontSize: "0.875rem",
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {link.label}
                      </MuiLink>
                    )}
                  </Box>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 5,
            pt: 4,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Built with care for players, casters, and crew of the Phasmo Tourney.
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {socialLinks.map((social) => (
              <MuiLink
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
                aria-label={social.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "color 0.2s, transform 0.2s",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {social.icon}
                <Typography variant="caption">{social.label}</Typography>
              </MuiLink>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
