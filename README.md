# gcyber-multicharacter
**Modular Multicharacter & Native 3D Character Creator Resource for G-CyberRPcore (CyberMP / Cyberpunk 2077)**

An enterprise-grade character selection and creation system designed specifically for REDengine multiplayer.

---

## Features
- **Multi-Slot Selection**: Up to 4 playable citizen identities per account with detailed stats.
- **Native 3D Character Creator**: Integration with Cyberpunk 2077's native `MenuScenario_CharacterCustomization`.
- **In-Game Deletion Modal**: Cyberpunk-themed modal confirmation within CEF to prevent accidental deletions.
- **Biometric Identity Wizard**: Choose Name, Date of Birth, Gender, Life Path (Street Kid, Nomad, Corpo), and backstory.
- **Decoupled Architecture**: Directly hooks into `global.G_CyberCore` and MySQL/SQLite database DAL.

---

## Installation
1. Place `gcyber-multicharacter` inside your server's `resources/` directory:
   ```text
   resources/gcyber-multicharacter/
   ```
2. Add `gcyber-multicharacter` to your `server.toml`:
   ```toml
   resources = [
     "G-CyberRPcore",
     "gcyber-multicharacter"
   ]
   ```

---

## License
MIT License. Part of the **G-CyberRPcore** ecosystem.
