const fs = require('fs');

const files = [
  'src/pages/HostDashboard.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/About.tsx',
  'src/pages/Bookings.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Terms.tsx',
  'src/pages/NewProperty.tsx',
  'src/pages/EditProperty.tsx',
  'src/pages/ChangePassword.tsx',
  'src/pages/PropertyDetails.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert inline style and pb-8 back to py-8 safe-area-pt
  content = content.replace(
    /className="container pb-8([^"]*)" style=\{\{ paddingTop: 'max\(2rem, env\(safe-area-inset-top\)\)' \}\}/g,
    'className="container py-8 safe-area-pt$1"'
  );
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
}
