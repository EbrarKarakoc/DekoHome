pipeline {
    agent any

    environment {
        IMAGE_NAME = "dekohome-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Kod çekiliyor...'
                git branch: 'main', url: 'https://github.com/EbrarKarakoc/DekoHome.git'
            }
        }

        stage('Build & Deploy') {
            steps {
                echo 'Docker Compose ile build ve deploy yapılıyor...'
                sh '''
                    docker compose down --remove-orphans || true
                    docker rm -f dekohome-app || true
                '''
                withCredentials([string(credentialsId: 'MONGO_URI', variable: 'DB_URI')]) {
                    sh '''
                        CLEAN_URI=$(echo "$DB_URI" | sed 's/^MONGODB_URI=//; s/^"//; s/"$//')
                        cat > .env << EOF
MONGODB_URI=$CLEAN_URI
JWT_SECRET=super_secret_jwt_key_for_dekohome_project
PORT=3000
NODE_ENV=production
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
SKIP_VITE=true
EOF
                        docker compose up -d --build --force-recreate
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Sağlık kontrolü yapılıyor...'
                sleep 15
                sh 'curl -f http://host.docker.internal:3000/v1/health || exit 1'
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
