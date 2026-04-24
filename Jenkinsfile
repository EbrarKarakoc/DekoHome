pipeline {
    agent any

    environment {
        // İmaj adını burada değişken olarak tanımlıyoruz
        IMAGE_NAME = "dekohome-app"
    }

    stages {
        stage('Cleanup') {
            steps {
                echo 'Eski konteynerler temizleniyor...'
                // Eğer daha önce çalışan bir konteyner varsa durdur ve sil
                sh "docker stop ${IMAGE_NAME} || true"
                sh "docker rm ${IMAGE_NAME} || true"
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Docker imajı oluşturuluyor...'
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Deploy') {
            steps {
                echo 'Uygulama yayına alınıyor...'
                // Şimdilik .env dosyasız çalıştırıyoruz, veritabanı bağlantısı Jenkins ayarlarından yapılacak
                sh "docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${IMAGE_NAME}"
            }
        }
    }

    post {
        success {
            echo 'CI/CD Süreci Başarıyla Tamamlandı!'
        }
        failure {
            echo 'Bir hata oluştu, lütfen logları kontrol edin.'
        }
    }
}
