import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-merchant',
  templateUrl: './merchant.page.html',
  styleUrls: ['./merchant.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class MerchantPage {
  namaMerchant = 'Bakso Pak Kumis';
  nominal!: number;

  qrImage: string = '';

  constructor(
    private toastCtrl: ToastController,
    private router: Router,
    private wallet: WalletService,
  ) { }

  async generateQR() {

    if (!this.nominal || this.nominal <= 0) {
      this.showToast('Masukkan nominal yang valid', 'danger');
      return;
    }

    // Potong saldo langsung saat generate
    const sukses = this.wallet.potongSaldo(
      this.nominal,
      this.namaMerchant
    );

    if (!sukses) {
      this.showToast('Saldo tidak cukup!', 'danger');
      return;
    }

    const dataQR = {
      merchant: this.namaMerchant,
      harga: this.nominal
    };

    const jsonString = JSON.stringify(dataQR);

    try {
      this.qrImage = await QRCode.toDataURL(jsonString);
      this.showToast('QR berhasil dibuat', 'success');
    } catch (error) {
      this.showToast('Gagal generate QR', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
