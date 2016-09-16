import { inject } from '@angular/core/testing/test_bed';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';
import { DecimalPipe } from '@angular/common';

import { TestBedBuilder } from '../../testing/testing';
import { InputNumberComponent } from './input-number.component';

describe('InputNumberComponent', () => {
    var testBed: TestBed;
    var fixture: ComponentFixture<InputNumberComponent>;
    var rootElement: any;
    var sut: InputNumberComponent;

    const FORMAT = '1.5-5';
    const validInputs = [
        ['0.00001', '0.00001'],
        ['0.012', '0.01200'],
        ['0.123', '0.12300'],
        ['0.1', '0.10000'],
        ['1.1', '1.10000'],
        ['123', '123.00000'],
        ['12345', '12,345.00000'],
        ['12345.0003', '12,345.00030'],
        ['-12345.0003', '-12,345.00030'],
        [0.00001, '0.00001'],
        [-12345.0003, '-12,345.00030']
    ];
    const invalidInputs = [
        'abracadabra',
        '123re',
        '123.45.67',
        null,
        new Date()
    ];

    beforeEach(() => {
        testBed = TestBedBuilder
            .useModuleDef({
                declarations: [InputNumberComponent],
                providers: [DecimalPipe]
            })
            .useHttpMocks()
            .generate();
    });

    beforeEach(async(() => {
        testBed.compileComponents().then(() => {
            fixture = testBed.createComponent(InputNumberComponent);
            fixture.detectChanges();

            sut = fixture.componentInstance;
            sut.format = FORMAT;

            rootElement = fixture.nativeElement;
        });
    }));

    it('should be instantiated with dependencies', async(() => {
        expect(sut).toBeTruthy();
    }));

    describe('when leftIcon starts with Bootstrap\'s "glyphicon-"', () => {
        function arrange() {
            sut.leftIcon = 'glyphicon-clock';
        }

        it('should NOT show glyph character', () => {
            arrange();
            // Assert
            expect(sut.showGlyphChar()).toBeFalsy();
        });
        it('should show glyph icon', () => {
            arrange();
            // Assert
            expect(sut.showGlyphIcon()).toBeTruthy();
        });
    });

    describe('when leftIcon does NOT start with Bootstrap\'s "glyphicon-" (e.g. "$")', () => {
        function arrange() {
            sut.leftIcon = '$';
        }

        it('should show glyph character', () => {
            arrange();
            // Assert
            expect(sut.showGlyphChar()).toBeTruthy();
        });
        it('should NOT show glyph icon', () => {
            arrange();
            // Assert
            expect(sut.showGlyphIcon()).toBeFalsy();
        });
    });

    describe('validation error', () => {
        function arrange(amount: any) {
            sut.amount = amount;
            sut.ngOnInit();
        }

        it(`should be present after formatting invalid value`, () => {
            arrange('abracadabra');
            // Act
            // Assert
            expect(sut.hasError).toBeTruthy();
        })

        it(`should NOT be present after formatting valid value`, () => {
            arrange('123');
            // Act
            // Assert
            expect(sut.hasError).toBeFalsy();
        })
    });

    describe(`initialization with format ${FORMAT} and valid input'`, () => {
        function arrange(amount: any) {
            sut.amount = amount;
        }

        validInputs.forEach(input => {
            var rawValidValue = input[0];
            var expectedResult = input[1];

            it(`should translate ${rawValidValue} into ${expectedResult}`, () => {
                arrange(rawValidValue);
                // Act
                sut.ngOnInit();
                // Assert
                expect(sut.formattedAmount).toEqual(expectedResult);
            })
        });
    });

    describe(`initialization with format ${FORMAT} and invalid input`, () => {
        function arrange(amount: any) {
            sut.amount = amount;
        }

        invalidInputs.forEach(rawInValidValue => {
            it(`should translate ${rawInValidValue} into itself`, () => {
                arrange(rawInValidValue);
                // Act
                sut.ngOnInit();
                // Assert
                expect(sut.formattedAmount).toBe(rawInValidValue);
            })
        });
    });
    
    describe('onFocus', () => {
        it(`should drop previously formatted valid amount`, () => {
            // Arrange
            const validAmount = 123;
            sut.amount = validAmount;
            sut.ngOnInit();
            // Assume
            expect(sut.formattedAmount).toBe('123.00000');
            
            // Act
            sut.onFocus();

            // Assert
            expect(sut.formattedAmount).toBe(validAmount);
        });

        it(`should drop previously formatted invalid amount`, () => {
            // Arrange
            const invalidAmount = 'abracadabra';
            sut.amount = invalidAmount;
            sut.ngOnInit();
            // Assume
            expect(sut.formattedAmount).toBe(invalidAmount);

            // Act
            sut.onFocus();

            // Assert
            expect(sut.formattedAmount).toBe(invalidAmount);
        });
    });

    describe('onBlur with valid entered amount', () => {
        validInputs.forEach(input => {
            var rawValidValue = input[0];
            var expectedResult = input[1];
            
            it(`should re-format ${rawValidValue} into ${expectedResult}`, () => {
                // Arrange
                const validAmount = rawValidValue;
                sut.amount = validAmount;
                // Act
                sut.onBlur(sut.amount);
                // Assert
                expect(sut.formattedAmount).toBe(expectedResult);
            });
        });
    });

    describe('onBlur with invalid entered amount', () => {
        invalidInputs.forEach(rawInvalidValue => {
            it(`should re-format ${rawInvalidValue} into itself`, () => {
                // Arrange
                sut.amount = rawInvalidValue;
                // Act
                sut.onBlur(sut.amount);
                // Assert
                expect(sut.formattedAmount).toBe(rawInvalidValue);
            });
        });
    });

    describe('onBlur with valid entered amount', () => {
        validInputs.forEach(input => {
            const rawValidValue = input[0];
            const expectedValue = +(<any>rawValidValue);

            it(`should fire event with numeric value entered ${expectedValue} for ${rawValidValue}`, () => {
                // Arrange
                sut.amount = rawValidValue;
                spyOn(sut.update, 'emit').and.callThrough();

                // Act
                sut.onBlur(sut.amount);
                // Assert
                expect(sut.update.emit).toHaveBeenCalledWith(expectedValue);
            });
        });
    });

    describe('onBlur with invalid entered amount', () => {
        invalidInputs.forEach(rawInvalidValue => {
            it(`should fire event with numeric value entered ${rawInvalidValue} for ${rawInvalidValue}`, () => {
                // Arrange
                const expectedValue = rawInvalidValue === null ? 0 : rawInvalidValue;

                sut.amount = rawInvalidValue;
                spyOn(sut.update, 'emit').and.callThrough();

                // Act
                sut.onBlur(sut.amount);
                // Assert
                expect(sut.update.emit).toHaveBeenCalledWith(expectedValue);
            });
        });
    });

    describe('direct <input> manipulations with JavaScript', () => {
        it('don\'t have to be detected at all', () => {
            pending('Learn more about testing components with DOM aspects');
        });
    });
});