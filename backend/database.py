from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./resume_screener.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    job_source = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    jd_requirements = Column(Text, nullable=True)

    resumes = relationship(
        "Resume",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("screening_sessions.id"),
        nullable=False
    )

    filename = Column(String, nullable=False)
    candidate_name = Column(String, nullable=True)
    education = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    resume_text = Column(Text, nullable=True)

    match_score = Column(String, nullable=True)
    shortlist = Column(String, nullable=True)
    justification = Column(Text, nullable=True)

    requirements = Column(Text, nullable=True)
    rank = Column(Integer, nullable=True)

    session = relationship(
        "ScreeningSession",
        back_populates="resumes"
    )


Base.metadata.create_all(bind=engine)