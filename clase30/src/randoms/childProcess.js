const getRandomNumbersDictionary = (numbersCount) => {
  const numbersDictionary = {};
  for (let i = 0; i < numbersCount; i++) {
    const newNumber = Math.random() * 1000;
    const finalNumber = Math.round(newNumber).toString();
    if (typeof numbersDictionary[finalNumber] === "undefined") {
      numbersDictionary[finalNumber] = 1;
    } else {
      numbersDictionary[finalNumber] += 1;
    }
  }
  return numbersDictionary;
};

process.on("message", (messageData) => {
  if (typeof messageData.numberCount === "undefined") {
    throw new Error(`No se ha enviado el parámetro "numberCount.`);
  }
  const { numberCount } = messageData;
  const randomNumbersCount = Number.parseInt(numberCount, 10);
  if (Number.isNaN(randomNumbersCount)) {
    throw new Error(
      `No se ha asignado un número correcto para generar valores numéricos.`
    );
  }
  const numbersDictionary = getRandomNumbersDictionary(randomNumbersCount);
  process.send({ numbersDictionary });
});
