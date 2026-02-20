import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  saldo = 100000;
  history: any[] = [];

  potongSaldo(nominal: number, merchant: string) {
    if (this.saldo >= nominal) {

      this.saldo -= nominal;

      this.history.unshift({
        waktu: new Date().toLocaleTimeString(),
        nominal,
        tipe: 'bayar',
        merchant
      });

      return true;
    }

    return false;
  }

  tambahSaldo(nominal: number) {
    this.saldo += nominal;

    this.history.unshift({
      waktu: new Date().toLocaleTimeString(),
      nominal,
      tipe: 'topup'
    });
  }
}

