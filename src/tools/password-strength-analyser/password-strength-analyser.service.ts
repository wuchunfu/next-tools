import { compact, identity } from 'lodash-es';

function prettifyExponentialNotation(exponentialNotation: number) {
  const parts = exponentialNotation.toString().split('e');
  const base = parts[0] ?? '';
  const exponent = parts[1];
  const baseAsNumber = Number.parseFloat(base);
  const prettyBase = baseAsNumber % 1 === 0 ? baseAsNumber.toLocaleString() : baseAsNumber.toFixed(2);
  return exponent ? `${prettyBase}e${exponent}` : prettyBase;
}

type TimeUnitTranslator = (key: string, defaultValue?: string) => string

function getHumanFriendlyDuration({
  seconds,
  t,
}: {
  seconds: number
  t?: TimeUnitTranslator
}) {
  const translate = t || ((key: string, defaultValue?: string) => defaultValue || key);

  if (seconds <= 0.001) {
    return translate('tools.password-strength-analyser.timeUnits.instantly', 'Instantly');
  }

  if (seconds <= 1) {
    return translate('tools.password-strength-analyser.timeUnits.lessThanASecond', 'Less than a second');
  }

  const timeUnits = [
    {
      unit: 'millenium',
      secondsInUnit: 31536000000,
      format: prettifyExponentialNotation,
      plural: 'millennia',
      translationKey: 'tools.password-strength-analyser.timeUnits.millenium',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.millennia',
    },
    {
      unit: 'century',
      secondsInUnit: 3153600000,
      plural: 'centuries',
      translationKey: 'tools.password-strength-analyser.timeUnits.century',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.centuries',
    },
    {
      unit: 'decade',
      secondsInUnit: 315360000,
      plural: 'decades',
      translationKey: 'tools.password-strength-analyser.timeUnits.decade',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.decades',
    },
    {
      unit: 'year',
      secondsInUnit: 31536000,
      plural: 'years',
      translationKey: 'tools.password-strength-analyser.timeUnits.year',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.years',
    },
    {
      unit: 'month',
      secondsInUnit: 2592000,
      plural: 'months',
      translationKey: 'tools.password-strength-analyser.timeUnits.month',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.months',
    },
    {
      unit: 'week',
      secondsInUnit: 604800,
      plural: 'weeks',
      translationKey: 'tools.password-strength-analyser.timeUnits.week',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.weeks',
    },
    {
      unit: 'day',
      secondsInUnit: 86400,
      plural: 'days',
      translationKey: 'tools.password-strength-analyser.timeUnits.day',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.days',
    },
    {
      unit: 'hour',
      secondsInUnit: 3600,
      plural: 'hours',
      translationKey: 'tools.password-strength-analyser.timeUnits.hour',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.hours',
    },
    {
      unit: 'minute',
      secondsInUnit: 60,
      plural: 'minutes',
      translationKey: 'tools.password-strength-analyser.timeUnits.minute',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.minutes',
    },
    {
      unit: 'second',
      secondsInUnit: 1,
      plural: 'seconds',
      translationKey: 'tools.password-strength-analyser.timeUnits.second',
      translationKeyPlural: 'tools.password-strength-analyser.timeUnits.seconds',
    },
  ];

  let remainingSeconds = seconds;
  const mapped = timeUnits.map(({ unit, secondsInUnit, plural, format = identity, translationKey, translationKeyPlural }) => {
    const quantity = Math.floor(remainingSeconds / secondsInUnit);
    remainingSeconds %= secondsInUnit;

    if (quantity <= 0) {
      return undefined;
    }

    const formattedQuantity = format(quantity);
    const unitKey = quantity > 1 ? translationKeyPlural : translationKey;
    const defaultUnitText = quantity > 1 ? plural : unit;
    const unitText = translate(unitKey, defaultUnitText);
    return `${formattedQuantity} ${unitText}`;
  });

  return compact(mapped).slice(0, 2).join(', ');
}

export function getPasswordCrackTimeEstimation({
  password,
  guessesPerSecond = 1e9,
}: {
  password: string
  guessesPerSecond?: number
}) {
  const charsetLength = getCharsetLength({ password });
  const passwordLength = password.length;

  const entropy = password === '' ? 0 : Math.log2(charsetLength) * passwordLength;

  const secondsToCrack = 2 ** entropy / guessesPerSecond;

  const score = Math.min(entropy / 128, 1);

  // Return a bound function that can be called with a translator
  const getFormattedDuration = (t?: TimeUnitTranslator) =>
    getHumanFriendlyDuration({ seconds: secondsToCrack, t });

  return {
    entropy,
    charsetLength,
    passwordLength,
    secondsToCrack,
    score,
    getFormattedDuration,
  };
}

export function getCharsetLength({ password }: { password: string }) {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSpecialChars = /\W|_/.test(password);

  let charsetLength = 0;

  if (hasLowercase) {
    charsetLength += 26;
  }
  if (hasUppercase) {
    charsetLength += 26;
  }
  if (hasDigits) {
    charsetLength += 10;
  }
  if (hasSpecialChars) {
    charsetLength += 32;
  }

  return charsetLength;
}
