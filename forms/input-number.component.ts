import { Input, Output, Component, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'input-number',
    templateUrl: './input-number.component.html',
})
export class InputNumberComponent {
    @Input() public amount: any;
    @Input() public format: string;
    @Input() public leftIcon: any;
    @Output() public update: EventEmitter<any> = new EventEmitter<any>();

    public formattedAmount: any;
    public hasError: boolean = false;

    constructor(private decimalPipe: DecimalPipe) { }

    ngOnInit() {
        this.formattedAmount = this.formatAmount(this.amount);
    }

    onFocus(): void {
        this.formattedAmount = this.amount;
    }

    onBlur(rawAmount: any): void {
        this.formattedAmount = this.formatAmount(rawAmount);

        const numericValueIfValid = this.hasError ? rawAmount : +rawAmount;
        this.update.emit(numericValueIfValid);
    }

    formatAmount(rawAmount: any): any {
        try {
            var formattedAmount = this.decimalPipe.transform(rawAmount, this.format);
            this.hasError = false;
            return formattedAmount;
        } catch (e) {
            console.debug('Value could not be formatted with decimal pipe.',
                'Value:', rawAmount,
                'Format:', this.format,
                'Pipe:', this.decimalPipe);
            this.hasError = true;
            return rawAmount;
        }
    }


    showGlyphChar(): boolean {
        return this.leftIcon && !this.showGlyphIcon();
    }

    showGlyphIcon(): boolean {
        return this.leftIcon && this.leftIcon.indexOf('glyphicon-') >= 0;
    }
}
