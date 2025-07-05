# TokenLink Plugin

A Minecraft Spigot plugin that generates secure login links for players to authenticate with your website.

## Features

- Generate secure login tokens for players
- Configurable cooldown system to prevent spam
- Integration with Supabase for token storage
- Clickable login links in chat
- Comprehensive logging system

## Requirements

- Java 17 or higher
- Spigot/Paper 1.21+
- Supabase account and project

## Installation

1. Download the latest release JAR file
2. Place the JAR file in your server's `plugins` folder
3. Start your server to generate the default configuration
4. Configure the plugin (see Configuration section)
5. Restart your server

## Configuration

Edit `plugins/TokenLink/config.yml`:

```yaml
supabase:
  url: "https://your-supabase-project.supabase.co"
  api-key: "your-supabase-anon-key"
logging:
  enabled: true
cooldown:
  seconds: 60
```

### Configuration Options

- `supabase.url`: Your Supabase project URL
- `supabase.api-key`: Your Supabase anonymous/public API key
- `logging.enabled`: Enable/disable detailed logging
- `cooldown.seconds`: Cooldown period between login attempts (in seconds)

## Supabase Setup

1. Create a new table called `login_tokens` with the following structure:

```sql
CREATE TABLE login_tokens (
  id SERIAL PRIMARY KEY,
  player_uuid TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Set up Row Level Security (RLS) policies as needed
3. Use your project URL and anon key in the configuration

## Usage

Players can use the `/login` command to generate a login link. The link will be clickable in chat and will redirect to your website with the authentication token.

## Building from Source

1. Clone the repository
2. Ensure you have Java 17 and Maven installed
3. Run: `mvn clean package`
4. The compiled JAR will be in the `target` folder

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please create an issue on the GitHub repository. 