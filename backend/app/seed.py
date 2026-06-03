from app.core.database import Base, SessionLocal, engine
from app.models.task import Category, Priority, Status
from app.repositories.task_repository import create_task, list_tasks
from app.schemas.task_schema import TaskCreate


SEED_TASKS = [
    TaskCreate(title="Fazer deploy do projeto Robo UST na Hostinger", category=Category.TRABALHO, priority=Priority.ALTA, status=Status.A_FAZER, next_action="Validar VPS e Docker", estimated_minutes=45),
    TaskCreate(title="Preparar aula de Spring Boot", category=Category.AULAS, priority=Priority.ALTA, status=Status.A_FAZER, next_action="Criar roteiro da explicacao inicial", estimated_minutes=60),
    TaskCreate(title="Revisar erro de Git remote origin", category=Category.TRABALHO, priority=Priority.MEDIA, status=Status.A_FAZER, next_action="Conferir URL do repositorio remoto", estimated_minutes=20),
    TaskCreate(title="Estudar ingles pelo metodo Feynman", category=Category.ESTUDOS, priority=Priority.BAIXA, status=Status.A_FAZER, next_action="Criar 5 frases simples em ingles", estimated_minutes=15),
    TaskCreate(title="Continuar projeto Rota Bioceanica", category=Category.PROJETOS, priority=Priority.MEDIA, status=Status.A_FAZER, next_action="Revisar proxima fase do app", estimated_minutes=30),
]


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if list_tasks(db):
            return
        for task in SEED_TASKS:
            create_task(db, task)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
