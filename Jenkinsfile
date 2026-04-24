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
                // Jenkins kasasından şifreyi çekip Docker'a veriyoruz
                withCredentials([string(credentialsId: 'MONGO_URI', variable: 'DB_URI')]) {
                    sh "docker run -d --name ${IMAGE_NAME} -p 3000:3000 -e MONGODB_URI=${DB_URI} ${IMAGE_NAME}"
                }
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
