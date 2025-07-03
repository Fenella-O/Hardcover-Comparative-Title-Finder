const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  'Enter your text (use ,  for new lines, finish with Ctrl+Z then Enter):\n',
  function handleInput(input) {
    // If input is empty, just close
    if (!input) {
      rl.close();
      return;
    }
    // Split input by new lines, add "sp" to each line, then join and print
    const lines = input
      .split(', ')
      .map((line) => '<option value="' + line + '">' + line + '</option>');
    const result = lines.join('\n');
    console.log('\nConverted text:\n' + result);
    rl.close();
  }
);
