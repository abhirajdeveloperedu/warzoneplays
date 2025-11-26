export default function AdsPage() {
  return (
    <html>
      <head>
        <title>Gaming News & Updates</title>
        {/* Monetag Auto Ads - Same script you provided */}
        <script 
          src="https://fpyf8.com/88/tag.min.js" 
          data-zone="188180"
          async
          data-cfasync="false"
        />
      </head>
      <body style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '30px' }}>
            🎮 Gaming News & Updates
          </h1>

          {/* Content blocks - Monetag will auto-inject ads between them */}
          <article style={{ marginBottom: '40px' }}>
            <h2>🏆 Top Gaming Tournaments This Week</h2>
            <p>The esports scene is heating up with major tournaments across Free Fire, BGMI, and Call of Duty Mobile. Players from around the world are competing for massive prize pools and glory.</p>
            <p>Whether you're a casual player or aspiring pro, there's never been a better time to join the competitive gaming community. Practice your skills, team up with friends, and climb the leaderboards!</p>
          </article>

          <article style={{ marginBottom: '40px' }}>
            <h2>🎯 Pro Tips for Battle Royale Games</h2>
            <ul>
              <li>Always land in areas with good loot but away from hot drops</li>
              <li>Master positioning - high ground wins fights</li>
              <li>Communication with teammates is key</li>
              <li>Practice aim in training mode</li>
              <li>Learn the map rotations</li>
            </ul>
          </article>

          <article style={{ marginBottom: '40px' }}>
            <h2>📱 Best Mobile Gaming Settings</h2>
            <p>Optimizing your device settings can significantly improve your gaming performance. Lower graphics for higher FPS - smooth gameplay beats pretty visuals in competitive matches.</p>
            <p>Find your perfect sensitivity through practice. Most pros use medium-low settings. Customize your HUD layout for comfortable reach during intense moments.</p>
          </article>

          <article style={{ marginBottom: '40px' }}>
            <h2>💰 How to Earn from Gaming</h2>
            <p>Gaming is no longer just a hobby - it can be a legitimate source of income:</p>
            <ol>
              <li>Join tournaments with cash prizes</li>
              <li>Stream your gameplay on YouTube Gaming</li>
              <li>Create gaming content and tutorials</li>
              <li>Become a coach for newer players</li>
              <li>Participate in esports leagues</li>
            </ol>
          </article>

          <article style={{ marginBottom: '40px' }}>
            <h2>🔥 Latest Free Fire Updates</h2>
            <p>Free Fire continues to dominate the mobile gaming scene with exciting new updates. New characters, weapons, and game modes are being added regularly.</p>
            <p>Stay updated with the latest patches and meta changes to maintain your competitive edge.</p>
          </article>

          <article style={{ marginBottom: '40px' }}>
            <h2>🎪 Upcoming Esports Events</h2>
            <p>Mark your calendars for these exciting esports events happening soon. Major tournaments with huge prize pools are waiting for skilled players.</p>
            <p>Registration is open for various skill levels - from beginners to pros!</p>
          </article>

          <footer style={{ textAlign: 'center', padding: '30px 0', borderTop: '1px solid #333', marginTop: '40px' }}>
            <p>© 2025 Warzone Esports. All rights reserved.</p>
            <p>Play responsibly. Gaming should be fun!</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
