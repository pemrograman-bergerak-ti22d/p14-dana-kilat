import { Component } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public wallet: WalletService,
    private router: Router,
  ) { }

  async scanQR() {

    const status = await BarcodeScanner.checkPermissions();
    if (status.camera !== 'granted') {
      await BarcodeScanner.requestPermissions();
    }

    document.querySelector('body')?.classList.add('barcode-scanner-active');

    const { barcodes } = await BarcodeScanner.scan();

    document.querySelector('body')?.classList.remove('barcode-scanner-active');

    if (barcodes.length > 0) {
      const scannedData = barcodes[0].rawValue;
      this.prosesPembayaran(scannedData!);
    }
  }

  async prosesPembayaran(dataQR: string) {
    try {

      const parsed = JSON.parse(dataQR);

      const merchant = parsed.merchant;
      const bayar = parsed.harga;

      if (!merchant || !bayar) {
        throw new Error('Format salah');
      }

      if (this.wallet.saldo >= bayar) {

        this.wallet.saldo -= bayar;

        this.wallet.history.unshift({
          waktu: new Date().toLocaleTimeString(),
          nominal: bayar,
          tipe: 'bayar'
        });

        this.tampilkanToast(
          `Berhasil bayar Rp ${bayar} ke ${merchant}`,
          'success'
        );

      } else {
        this.tampilkanToast('Saldo tidak cukup!', 'danger');
      }

    } catch (error) {
      this.tampilkanToast('QR tidak valid!', 'danger');
    }
  }

  async tampilkanToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async isiSaldo() {
    const alert = await this.alertCtrl.create({
      header: 'Isi Saldo',
      inputs: [
        {
          name: 'nominal',
          type: 'number',
          placeholder: 'Masukkan nominal'
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Isi',
          handler: (data) => {
            const nominal = parseInt(data.nominal);

            if (!nominal || nominal <= 0) {
              this.tampilkanToast('Nominal tidak valid!', 'danger');
              return false;
            }

            this.wallet.saldo += nominal;

            this.wallet.history.unshift({
              waktu: new Date().toLocaleTimeString(),
              nominal: nominal,
              tipe: 'topup'
            });

            this.tampilkanToast(
              `Berhasil isi saldo Rp ${nominal}`,
              'success'
            );

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  goToMerchant() {
    this.router.navigate(['/merchant']);
  }
}
