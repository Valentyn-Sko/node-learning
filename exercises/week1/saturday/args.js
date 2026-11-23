console.log('Arguments:', process.argv.slice(2));

const appEnv = Object.entries(process.env)
    .filter(([key]) => key.startsWith('APP_'));

console.log('APP_ Environment variables:', Object.fromEntries(appEnv));