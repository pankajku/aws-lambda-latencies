async function testfun(e:boolean): Promise<void> {
  if (e) {
    console.log('Error ...');
    throw Error('Error ...');
  } else {
    console.log('Success ...');
  }
}

await testfun(true);

