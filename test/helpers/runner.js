async function test(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

async function run(tests) {
  for (const [name, fn] of tests) {
    await test(name, fn);
  }
}

module.exports = { run };
