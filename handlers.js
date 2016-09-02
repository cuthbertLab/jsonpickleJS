export const handlers = {
    'fractions.Fraction': {
        restore: (obj) => obj._numerator / obj._denominator,
    },
};
