import {expect} from 'chai';

describe('Array', () => {
    describe('#indexOf()', () => {
        it('should return -1 when the value is not present', () => {
            const index = [1,2,3].indexOf(4);
            expect(index).to.equal(-1);
        });
    });
});

