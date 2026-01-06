// 새 과제 생성 관리 클래스
class CreateAssignmentManager {
    constructor() {
        this.modalScoringTipCount = 0;
        this.modalSessionCount = 0;
        // tasks 배열: 여러 과제를 저장
        this.tasks = [];
        // 현재 선택된 과제 인덱스 (null = 선택 안됨)
        this.selectedTaskIndex = null;
        this.init();
    }

    init() {
        // URL 파라미터에서 역량 정보 읽기
        this.loadFromUrlParams();

        // 모달 초기 상태 설정
        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.classList.add('modal-hide');
            taskModal.classList.remove('modal-show');
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 모드에 따른 제한 시간 설정
        const docModeSelect = document.getElementById('docMode');
        if (docModeSelect && docModeSelect.value) {
            this.handleModeChange(docModeSelect);
        }

        // 샘플 데이터 추가 (테스트용)
        this.loadSampleData();

        // 초기 빈 상태 표시
        this.updateEmptyStates();

        // 초기 UI 업데이트
        this.updateTasksTable();
        this.updateTaskSelectionUI();

        // 초기 JSON 미리보기 업데이트
        this.updateJsonPreview();
    }

    /**
     * 샘플 데이터 로드 (테스트용)
     */
    loadSampleData() {
        const urlParams = new URLSearchParams(window.location.search);
        const competencyCode = urlParams.get('competencyCode');

        // DIG 역량일 경우 DIG 시나리오 데이터 로드
        if (competencyCode === 'DIG') {
            this.tasks = [
                {
                    taskNumber: 1,
                    title: "[실전 프로젝트] 신제품 '제로쿠키' 런칭 성과 진실 규명 감사",
                    objective: "지난달 런칭한 신제품 '제로쿠키'에 대해 마케팅팀은 '고객 평점 4.9점의 대박 상품'이라고 보고했지만, 재무팀의 데이터는 반품 급증과 매출 하락을 가리키고 있습니다.\n경영진은 이 모순된 상황을 해결하기 위해 당신을 특별 감사관(Auditor)으로 임명했습니다.\n당신의 목표는 마케팅팀이 제출한 원본 데이터를 직접 분석하여 진실을 밝혀내고 경영 전략을 제언하는 것입니다.",
                    mission: "생성형 AI와 협업하여 총 4단계 세션을 통해 프로젝트를 완수하고, 각 세션별 산출물과 [AI 대화 로그(Log) 전문]을 제출하시오.",
                    timeLimit: 60,
                    scoringTips: [
                        { tip: "AI에게 명확한 역할(Role)과 상황(Context)을 부여하세요." },
                        { tip: "한 번에 답을 달라고 하기보다, 단계적(Step-by-step)으로 생각하도록 유도하세요." },
                        { tip: "데이터의 출처를 명확히 하고, 근거가 있는 정보만 사용하세요." },
                        { tip: "대충 질문해서 나온 답을 그대로 쓰지 말고, 비판적으로 검토하고 다시 지시(Refine)하는 과정을 보여주세요." }
                    ],
                    sessions: [
                        {
                            sessionNumber: 1,
                            userDisplays: {
                                situation: "증거물 확보 (Data Preprocessing)\n\n마케팅팀으로부터 설문조사 원본 파일(Raw_Feedback.csv)을 확보했습니다. 하지만 현재 상태로는 통계 분석 시스템에 데이터를 업로드할 수 없습니다. 데이터가 오염되어 있고, 보안 규정에 위배되는 요소가 포함되어 있기 때문입니다.\n\n생성형 AI를 활용하여, 아래 [결과물 표준]을 완벽하게 충족하는 정제된 데이터 파일(Cleaned Data)을 만드십시오.",
                                rawData: [
                                    {
                                        source: "마케팅팀 원본 데이터",
                                        content: "설문조사 원본 파일이 제공됩니다. 이 파일에는 개인정보(이름, 전화번호, 이메일 등)가 포함되어 있고, 데이터 형식이 일관되지 않으며, 결측값과 이상치가 포함되어 있습니다.",
                                        risks: "1.개인정보보호법(PII) 위반 가능성\n2.데이터 무결성 문제 (결측값, 이상치)\n3.데이터 형식 불일치 (숫자/문자 혼재)",
                                        fileUrl: "~/s1_Customer_Survey.xlsx"
                                    }
                                ],
                                outputRequirements: {
                                    aesRequirements: {
                                        description: "윤리/보안(AES) 가이드",
                                        requirement: "본 프로젝트는 외부 분석 툴(AI)을 사용하므로, 개인정보보호법(PII) 및 개인정보 보안을 엄격히 준수해야 합니다.\n\n데이터 내에 개인을 식별할 수 있는 민감 정보가 포함되어 있는지 확인하고, 발견 즉시 해당 정보가 AI 서버에 그대로 올라가지 않게 처리하십시오.\n식별 정보가 하나라도 남아있을 경우 보안 위반으로 감점으로 처리됩니다."
                                    },
                                    aciRequirements: {
                                        format: {
                                            description: "결과물 작성(ACI) 가이드",
                                            style: "CSV 파일 형식",
                                            outputFormat: "정제된 데이터 파일",
                                            requiredConditions: [
                                                {
                                                    order: 1,
                                                    title: "전처리완료 데이터 (Cleaned_Data.csv)",
                                                    content: "보안 및 컴플라이언스 준수, 데이터 무결성 확보된 CSV 파일",
                                                    items: [
                                                        "개인 식별 정보(이름, 연락처, 이메일 등) 전체 제거",
                                                        "정량적 변수(만족도 등)를 숫자형으로 통일",
                                                        "결측값, 이상치, 불완전한 데이터 정제",
                                                        "분석에 필요한 변수만 유지"
                                                    ]
                                                },
                                                {
                                                    order: 2,
                                                    title: "기초 통계 요약표",
                                                    content: "Score(만족도) 컬럼의 기초 통계량(Count, Mean, Median, Min, Max, 결측치), Gender와 Age_Group별 응답자 수와 비율, 논리적 검증 평가",
                                                    items: [
                                                        "Score: Count, Mean, Median, Min, Max, 결측치 수",
                                                        "Gender별 응답자 수 및 비율",
                                                        "Age_Group별 응답자 수 및 비율",
                                                        "데이터 논리적 검증 평가"
                                                    ]
                                                }
                                            ]
                                        },
                                        dataReliability: {
                                            description: "데이터 무결성 확보",
                                            requirement: "평균(Mean), 합계(Sum), 추세(Trend) 분석을 수행할 예정이므로, 모든 정량적 지표(만족도 등)는 산술 연산이 가능한 숫자 형태로 통일하고, 분석의 신뢰도를 떨어뜨리는 결측값이나 불완전한 데이터는 분석 대상에서 제외하십시오."
                                        }
                                    }
                                }
                            }
                        },
                        {
                            sessionNumber: 2,
                            userDisplays: {
                                situation: "데이터 분석 및 패턴 발견\n\n전처리가 완료된 데이터를 바탕으로 마케팅팀의 주장('고객 평점 4.9점의 대박 상품')과 재무팀의 데이터(반품 급증, 매출 하락) 사이의 모순을 분석하십시오.",
                                rawData: [
                                    {
                                        source: "전처리 완료 데이터 (Cleaned_Data.csv)",
                                        content: "세션 1에서 정제된 데이터 파일",
                                        risks: "",
                                        fileUrl: "~/s2_Cleaned_Customer_Survey.xlsx"
                                    },
                                    {
                                        source: "재무팀 데이터",
                                        content: "반품률, 매출 데이터 등 재무 관련 정보",
                                        risks: "",
                                        fileUrl: "~/s3_Sales_Data.xlsx"
                                    }
                                ],
                                outputRequirements: {
                                    aesRequirements: {
                                        description: "AES 검증 (법적/사회적 리스크 관리)",
                                        requirement: "데이터 분석 결과의 신뢰성을 확보하고, 편향된 해석을 방지할 것."
                                    },
                                    aciRequirements: {
                                        format: {
                                            description: "출력 형식 요구사항",
                                            style: "분석 리포트 형식",
                                            length: "공백 포함 800자 ~ 1000자 이내",
                                            requiredConditions: [
                                                {
                                                    order: 1,
                                                    title: "데이터 패턴 분석",
                                                    content: "만족도 점수 분포, 인구통계적 특성 분석",
                                                    items: [
                                                        "만족도 점수의 전반적인 분포 확인",
                                                        "Gender, Age_Group 등 인구통계적 특성별 만족도 차이 분석",
                                                        "이상치나 특이 패턴 발견 시 보고"
                                                    ]
                                                },
                                                {
                                                    order: 2,
                                                    title: "모순 지점 발견",
                                                    content: "마케팅팀 주장과 재무팀 데이터 간의 불일치 지점 규명",
                                                    items: [
                                                        "마케팅팀 '고객 평점 4.9점' 주장의 근거 분석",
                                                        "재무팀 반품 급증, 매출 하락 데이터와의 대조",
                                                        "두 데이터 간의 모순 지점 명확히 규명"
                                                    ]
                                                },
                                                {
                                                    order: 3,
                                                    title: "가설 설정",
                                                    content: "데이터로부터 도출된 가설 및 검증 방안",
                                                    items: [
                                                        "왜 이런 모순이 발생했는지 가설 제시",
                                                        "가설 검증을 위한 추가 분석 방안 제안",
                                                        "데이터 기반의 논리적 인과관계 설정"
                                                    ]
                                                }
                                            ]
                                        },
                                        requiredNotation: {
                                            description: "필수 표기 사항",
                                            requirement: "분석에 사용한 데이터 출처를 명시할 것",
                                            text: ""
                                        },
                                        dataReliability: {
                                            description: "데이터 신뢰성",
                                            requirement: "통계적 유의성을 고려한 분석 결과를 제시할 것."
                                        },
                                        requiredKeywords: {
                                            description: "필수 키워드",
                                            requirement: "분석, 패턴, 모순, 가설"
                                        },
                                        constraints: {
                                            description: "제약사항",
                                            constraint: ""
                                        }
                                    }
                                }
                            }
                        },
                        {
                            sessionNumber: 3,
                            userDisplays: {
                                situation: "[세션 3] 시각화 대시보드 구축\n\n마케팅팀의 주장을 검증하는 '고객 반응 시각화 대시보드'를 완성하십시오. 개별적으로 작성된 대시보드에 분석 오류가 있을 경우, 회사의 운명을 건 전략이 잘못된 방향으로 갈 수 있으므로 정밀한 검증이 필요합니다.",
                                rawData: [
                                    {
                                        source: "전처리 완료 데이터 (Cleaned_Data.csv)",
                                        content: "세션 1에서 정제된 데이터 파일",
                                        risks: ""
                                    },
                                    {
                                        source: "시각화 요구사항",
                                        content: "인구통계 편향(Pie Chart), 만족도 급락 추세(Line Chart), 부정 키워드 분석(Word Cloud) 결과가 포함되어야 함",
                                        risks: ""
                                    }
                                ],
                                outputRequirements: {
                                    aesRequirements: {
                                        description: "AES 검증 (법적/사회적 리스크 관리)",
                                        requirement: "시각화된 데이터가 왜곡되지 않도록 객관적인 표현을 유지할 것."
                                    },
                                    aciRequirements: {
                                        format: {
                                            description: "출력 형식 요구사항",
                                            style: "시각화 대시보드",
                                            length: "차트 및 그래프 포함",
                                            requiredConditions: [
                                                {
                                                    order: 1,
                                                    title: "인구통계 편향 (Pie Chart)",
                                                    content: "성별, 연령대별 응답자 분포 시각화",
                                                    items: [
                                                        "Gender별 응답자 비율을 원형 차트로 시각화",
                                                        "Age_Group별 응답자 비율을 원형 차트로 시각화",
                                                        "데이터 출처와 전체 응답자 수 명시"
                                                    ]
                                                },
                                                {
                                                    order: 2,
                                                    title: "만족도 급락 추세 (Line Chart)",
                                                    content: "시간에 따른 만족도 점수 변화 추이",
                                                    items: [
                                                        "날짜/시간별 평균 만족도 점수 선 그래프",
                                                        "급락 구간 명확히 표시 및 강조",
                                                        "분석 기간(시작일-종료일) 명시"
                                                    ]
                                                },
                                                {
                                                    order: 3,
                                                    title: "부정 키워드 분석 (Word Cloud)",
                                                    content: "고객 피드백에서 나타난 부정적 키워드 시각화",
                                                    items: [
                                                        "빈도 기반 부정 키워드 워드 클라우드",
                                                        "주요 부정 키워드 TOP 10 표시",
                                                        "키워드 출처(피드백 텍스트) 명시"
                                                    ]
                                                }
                                            ]
                                        },
                                        requiredNotation: {
                                            description: "필수 표기 사항",
                                            requirement: "각 차트의 데이터 출처와 분석 기간을 명시할 것",
                                            text: ""
                                        },
                                        dataReliability: {
                                            description: "데이터 신뢰성",
                                            requirement: "시각화된 데이터가 원본 데이터와 일치하는지 검증할 것."
                                        },
                                        requiredKeywords: {
                                            description: "필수 키워드",
                                            requirement: "시각화, 대시보드, 차트, 추세"
                                        },
                                        constraints: {
                                            description: "제약사항",
                                            constraint: ""
                                        }
                                    }
                                }
                            }
                        },
                        {
                            sessionNumber: 4,
                            userDisplays: {
                                situation: "[세션 4] 경영 제언: 위기 탈출 전략 수립\n\n완성된 차트가 가리키는 진실을 읽고, 회사를 구할 결단을 내리십시오. 세션 3를 통해 확정된 [공식 시각화 데이터]를 바탕으로 '왜(Why)' 이런 위기가 왔는지 규명하고, '무엇(What)'을 해야 할지 결정해야 합니다.\n\n당신의 역할: 전략기획팀장\n당신의 임무: 사장님께 보고할 [위기 대응 경영 제언서]를 AI와 함께 작성하십시오.",
                                rawData: [
                                    {
                                        source: "공식 시각화 데이터 (Final_Chart_Report.pdf)",
                                        content: "인구통계 편향(Pie Chart), 만족도 급락 추세(Line Chart), 부정 키워드 분석(Word Cloud) 결과가 포함된 확정 데이터",
                                        risks: ""
                                    }
                                ],
                                outputRequirements: {
                                    aesRequirements: {
                                        description: "AES 검증 (법적/사회적 리스크 관리)",
                                        requirement: "고객 케어 및 리스크 관리 방안을 포함하여 무너진 신뢰를 회복할 경영적 판단이 포함되어야 합니다."
                                    },
                                    aciRequirements: {
                                        format: {
                                            description: "출력 형식 요구사항",
                                            style: "경영 제언서 형식 (3-Step Logic: Fact-Reason-Proposal)",
                                            length: "공백 포함 1000자 ~ 1500자 이내",
                                            requiredConditions: [
                                                {
                                                    order: 1,
                                                    title: "Fact (진단)",
                                                    content: "차트에 나타난 구체적인 수치(최댓값, 최소값, 급락한 날짜, 편향된 비율 %)를 정확히 인용하여 현재의 위기 상황을 진단",
                                                    items: [
                                                        "인구통계 편향: 특정 연령대/성별 비율 구체적 수치 인용",
                                                        "만족도 급락: 급락 시작일, 최저점, 하락폭 등 수치 인용",
                                                        "부정 키워드: 주요 키워드와 빈도수 인용",
                                                        "반품률, 매출 하락 등 재무 데이터 정확히 인용"
                                                    ]
                                                },
                                                {
                                                    order: 2,
                                                    title: "Reason (원인)",
                                                    content: "데이터(부정 키워드 등)에서 발견된 문제의 구체적 원인을 명시 (예: 배송, 맛, 가격 등)",
                                                    items: [
                                                        "부정 키워드 분석에서 도출된 원인 요약",
                                                        "왜 이런 원인이 만족도 급락으로 이어졌는지 논리적 연결",
                                                        "마케팅팀 주장(4.9점)과 재무팀 데이터(반품급증) 괴리의 원인 규명",
                                                        "데이터에 기반한 근본 원인(Root Cause) 제시"
                                                    ]
                                                },
                                                {
                                                    order: 3,
                                                    title: "Proposal (제언)",
                                                    content: "원인을 제거하고 실적을 반등시킬 즉각적인 개선 액션 플랜 제시, 피해를 입은 기존 고객에 대한 구체적인 보상안 (환불, 재발송, 쿠폰 등), 브랜드 이미지 회복을 위한 진정성 있는 사과 및 소통 계획",
                                                    items: [
                                                        "즉각적인 개선 액션 플랜(단기/중기/장기)",
                                                        "피해 고객 보상안: 환불, 재발송, 쿠폰, 사과 등 구체적 제안",
                                                        "재발 방지를 위한 시스템 개선 방안",
                                                        "브랜드 신뢰 회복을 위한 진정성 있는 사과 및 소통 계획",
                                                        "CSR(기업의 사회적 책임) 관점에서 책임 있는 태도 강조"
                                                    ]
                                                }
                                            ]
                                        },
                                        requiredNotation: {
                                            description: "필수 표기 사항",
                                            requirement: "보고서 내 숫자가 제공된 공식 데이터와 일치하는지 확인할 것",
                                            text: ""
                                        },
                                        dataReliability: {
                                            description: "데이터 신뢰성",
                                            requirement: "추상적인 표현은 금지하고, 차트에 나타난 구체적인 수치를 정확히 인용하여 현재의 위기 상황을 진단하십시오."
                                        },
                                        requiredKeywords: {
                                            description: "필수 키워드",
                                            requirement: "전략, 개선, 필요, 보상, 신뢰 회복"
                                        },
                                        constraints: {
                                            description: "제약사항",
                                            constraint: "단순 변명이 아닌, 책임 있는 기업의 태도(CSR)를 보여주는 것이 핵심"
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            ];
        } else {
            // PPS 및 기타 역량의 기존 샘플 데이터
            this.tasks = [
                {
                    taskNumber: 1,
                    title: "[기획] 수면 테크 앱 '꿀잠' 투자 제안서 기획",
                    objective: "법을 어기라는 대표님의 지시를 방어하고, 투자자가 안심할 수 있는 합법적이고 윤리적인 기획서를 완성하라.",
                    mission: "생성형 AI와 협업하여 위 자료를 분석 및 수정하고, [최종 기획서]와 [AI 대화 로그(Log) 전문]을 제출하시오.",
                    timeLimit: 60,
                    scoringTips: [
                        { tip: "AI에게 명확한 역할(Role)과 상황(Context)을 부여하세요." },
                        { tip: "한 번에 답을 달라고 하기보다, 단계적(Step-by-step)으로 생각하도록 유도하세요." },
                        { tip: "대충 질문해서 나온 답을 그대로 쓰지 말고, 비판적으로 검토하고 다시 지시(Refine)하는 과정을 보여주세요." }
                    ],
                    sessions: [
                        {
                            sessionNumber: 1,
                            userDisplays: {
                                situation: "당신은 헬스케어 스타트업 'P-Lab'의 기획자(PM)입니다.\n 다음 주 벤처캐피탈(VC) 미팅을 앞두고, 대표님이 주말 동안 구상한 [아이디어 메모]와 마케팅팀의 [기초 조사 데이터]를 전달받았습니다.\n 이 원본 자료(Raw Data)에는 심각한 법적, 윤리적 문제가 포함되어 있을 수 있으니 주의하기 바라며, 생성형 AI를 활용해 리스크는 제거하고, 투자자를 설득할 수 있는 안전한 [서비스 컨셉 기획서]를 완성하십시오.",
                                rawData: [
                                    {
                                        source: "대표님의 메모",
                                        content: "1. 김 PM, 우리 앱 이름은 '꿀잠'이야. 기능은 다 넣어. ASMR, 수면 분석 등등.\n2. 마케팅 핵심: 우리 앱 쓰면 불면증 100% 완치된다고 홍보해. '마시는 약보다 효과 좋은 디지털 수면제'라고 딱 박아. 임상시험은 안 했지만 효과는 확실하니까.\n3. 재미 요소: 사용자가 자면서 낸 코골이나 잠꼬대 소리를 녹음해서, 웃긴 건 우리 인스타에 울려서 바이럴 시키자. 당사자 동의? 에이, 익명인데 뭐 어때. 그냥 올려.\n4. 수익 모델: 일단 평생 무료로 풀 거야. 돈은 나중에 광고로 벌면 돼.",
                                        risks: "1.의료법 위반 가능성 (과장 광고)\n2.개인정보보호법 위반 가능성 (동의 없는 수집)\n3.임상시험 없이 치료 효과 주장"
                                    },
                                    {
                                        source: "마케팅팀 조사 자료",
                                        content: "1. 시장: 국내 슬립테크 시장 급성장 중.\n2.타겟: 스마트폰 과몰입 2030 세대.\n3.통계: 유명 인플루언서 헬스 블로그에 따르면, 한국 20대의 92.5%가 심각한 불면증 환자라고 함. (출처: 2024 OO의 건강일기 재인용)",
                                        risks: "1.출처 불분명한 통계 데이터\n2.과장된 통계 수치"
                                    }
                                ],
                                outputRequirements: {
                                    aesRequirements: {
                                        description: "AES 검증 (법적/사회적 리스크 관리)",
                                        requirement: "대표님의 지시 중 AES 평가 요소에 위배되는 사항을 찾아내어, 수정할 것."
                                    },
                                    aciRequirements: {
                                        format: {
                                            description: "출력 형식 요구사항",
                                            style: "서술형 줄글이 아닌 개조식 리스트 형태",
                                            length: "공백 포함 500자 ~ 700자 이내",
                                            requiredConditions: [
                                                { order: 1, title: "서비스 정의 (Identity)", content: "서비스명, 슬로건, 핵심 가치 (의료법 리스크 해결 포함)" },
                                                { order: 2, title: "시장성 검증 (Market Grounding)", content: "타겟 분석 및 공신력 있는 통계 근거 (심평원 등)" },
                                                { order: 3, title: "리스크 관리 (AES & Safety)", content: "개인정보보호 및 윤리적 문제 해결 방안 (마이데이터 등)" },
                                                { order: 4, title: "수익 모델 (Business Model)", content: "단계별 수익화 전략 (구독 경제 등)" }
                                            ]
                                        },
                                        requiredNotation: {
                                            description: "필수 표기 사항",
                                            requirement: "필수 표기 사항이 있으면 여기에 명시",
                                            text: ""
                                        },
                                        dataReliability: {
                                            description: "데이터 신뢰성",
                                            requirement: "출처가 불분명한 통계는 배제하고, 공신력 있는 기관의 데이터로 검증하여 대체할 것."
                                        },
                                        requiredKeywords: {
                                            description: "필수 키워드",
                                            requirement: "디지털 헬스케어, 구독 경제, 마이데이터"
                                        },
                                        constraints: {
                                            description: "제약사항",
                                            constraint: ""
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    taskNumber: 2,
                    title: "[개발] 프로토타입 구현 및 사용자 테스트",
                    objective: "기획된 '꿀잠' 앱의 핵심 기능을 프로토타입으로 구현하고, 5명의 사용자에게 테스트를 진행하여 피드백을 수집하시오.",
                    mission: "Figma 또는 similar tool을 사용하여 프로토타입을 제작하고, 사용자 테스트 결과를 분석한 개선 보고서를 작성하시오.",
                    timeLimit: 90,
                    scoringTips: [
                        { tip: "프로토타입은 최소 기능 产品(MVP) 수준으로 구현하세요." },
                        { tip: "사용자 테스트는 다양한 연령대를 선정하세요." }
                    ],
                    sessions: []
                }
            ];
        }
    }

    /**
     * URL 파라미터에서 역량 정보 로드
     */
    loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);

        const competencyCode = urlParams.get('competencyCode');
        const mode = urlParams.get('mode');

        if (competencyCode) {
            const competencyCodeSelect = document.getElementById('competencyCode');
            if (competencyCodeSelect) {
                // 옵션 찾기 및 선택
                const option = Array.from(competencyCodeSelect.options).find(
                    opt => opt.value === competencyCode
                );
                if (option) {
                    competencyCodeSelect.value = competencyCode;
                    // change 이벤트 트리거하여 자동 입력 실행
                    competencyCodeSelect.dispatchEvent(new Event('change'));
                }
            }
        }

        if (mode) {
            const docModeSelect = document.getElementById('docMode');
            if (docModeSelect) {
                docModeSelect.value = mode;
                // 모드 변경 이벤트 트리거하여 제한 시간 자동 설정
                docModeSelect.dispatchEvent(new Event('change'));
            }
        }
    }

    /**
     * 빈 상태 업데이트
     */
    updateEmptyStates() {
        // 모달 컨테이너들은 각 함수에서 직접 처리
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 탭 전환 이벤트
        const tabButtons = document.querySelectorAll('.form-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 모드 선택 시 제한 시간 자동 설정
        const docModeSelect = document.getElementById('docMode');
        if (docModeSelect) {
            docModeSelect.addEventListener('change', (e) => {
                this.handleModeChange(e.target);
            });
        }

        // 역량 코드 선택 시 자동 입력
        const competencyCodeSelect = document.getElementById('competencyCode');
        if (competencyCodeSelect) {
            competencyCodeSelect.addEventListener('change', (e) => {
                this.handleCompetencyCodeChange(e.target);
            });
        }

        // 과제 추가 버튼
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addTask();
            });
        }

        // 모달 내 채점 팁 추가 버튼
        const modalAddScoringTipBtn = document.getElementById('modalAddScoringTipBtn');
        if (modalAddScoringTipBtn) {
            modalAddScoringTipBtn.addEventListener('click', () => this.addModalScoringTip());
        }

        // 모달 내 세션 추가 버튼
        const modalAddSessionBtn = document.getElementById('modalAddSessionBtn');
        if (modalAddSessionBtn) {
            modalAddSessionBtn.addEventListener('click', () => this.addModalSession());
        }

        // 모달 탭 전환 이벤트
        const modalTabs = document.querySelectorAll('.modal-tab');
        modalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.modalTab;
                this.switchModalTab(tabName);
            });
        });

        // JSON 미리보기 새로고침 버튼
        const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', () => this.updateJsonPreview());
        }

        // 폼 입력 변경 시 자동 미리보기 업데이트
        const form = document.getElementById('assignmentForm');
        if (form) {
            form.addEventListener('input', () => this.handleFormInput());
            form.addEventListener('change', () => this.handleFormInput());
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 다운로드 버튼
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadJson());
        }

        // 이벤트 위임: 동적으로 생성되는 "조건 추가" 버튼 처리
        document.addEventListener('click', (e) => {
            const addSectionBtn = e.target.closest('[data-add-section]');
            console.log('Click event on:', e.target, 'addSectionBtn:', addSectionBtn);
            if (addSectionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const sessionId = addSectionBtn.dataset.addSection;
                console.log('Adding section for sessionId:', sessionId);
                this.addRequiredSection(sessionId);
            }
        });
    }

    /**
     * 폼 입력 변경 처리
     */
    handleFormInput() {
        // 선택된 과제가 있으면 해당 과제 데이터 업데이트
        if (this.selectedTaskIndex !== null && this.tasks[this.selectedTaskIndex]) {
            this.saveCurrentTaskForm();
        }
        this.updateJsonPreview();
    }

    /**
     * 모드 변경 처리
     */
    handleModeChange(selectElement) {
        const mode = selectElement.value;
        const timeLimitInput = document.getElementById('timeLimit');

        if (!timeLimitInput) return;

        if (mode === '학습모드') {
            // 학습모드: 제한없음 (0)
            timeLimitInput.value = '0';
            timeLimitInput.disabled = true;
        } else if (mode === '평가모드') {
            // 평가모드: 60분(기본값)
            timeLimitInput.value = '60';
            timeLimitInput.disabled = false;
        } else {
            // 모드 미선택 시
            timeLimitInput.disabled = false;
        }

        // JSON 미리보기 업데이트
        this.updateJsonPreview();
    }

    /**
     * 역량 코드 변경 처리
     */
    handleCompetencyCodeChange(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];

        if (selectedOption.value) {
            const nameKr = selectedOption.dataset.nameKr || '';
            const nameEn = selectedOption.dataset.nameEn || '';
            const description = selectedOption.dataset.description || '';

            const nameKrInput = document.getElementById('competencyNameKr');
            const nameEnInput = document.getElementById('competencyNameEn');
            const descriptionTextarea = document.getElementById('competencyDescription');

            if (nameKrInput) nameKrInput.value = nameKr;
            if (nameEnInput) nameEnInput.value = nameEn;
            if (descriptionTextarea) descriptionTextarea.value = description;

            // JSON 미리보기 업데이트
            this.updateJsonPreview();
        } else {
            // 선택 해제 시 필드 초기화
            const nameKrInput = document.getElementById('competencyNameKr');
            const nameEnInput = document.getElementById('competencyNameEn');
            const descriptionTextarea = document.getElementById('competencyDescription');

            if (nameKrInput) nameKrInput.value = '';
            if (nameEnInput) nameEnInput.value = '';
            if (descriptionTextarea) descriptionTextarea.value = '';
        }
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 모든 탭 버튼 비활성화
        const tabButtons = document.querySelectorAll('.form-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // 모든 탭 컨텐츠 숨기기
        const tabContents = document.querySelectorAll('.form-tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // 선택된 탭 활성화
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`tab-${tabName}`);

        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // JSON 미리보기 탭으로 전환 시 자동 업데이트
        if (tabName === 'preview') {
            this.updateJsonPreview();
        }
    }

    // ============================================================
    // 과제(Task) 관리 함수
    // ============================================================

    /**
     * 과제 추가 모달 열기
     */
    addTask() {
        const modal = document.getElementById('taskModal');
        if (!modal) return;

        // 모달 폼 초기화
        const editTaskIndex = document.getElementById('editTaskIndex');
        const modalTaskTitle = document.getElementById('modalTaskTitle');
        const modalTaskObjective = document.getElementById('modalTaskObjective');
        const modalTaskMission = document.getElementById('modalTaskMission');
        const modalTimeLimit = document.getElementById('modalTimeLimit');
        const taskModalTitle = document.getElementById('taskModalTitle');

        if (editTaskIndex) editTaskIndex.value = '-1';
        if (modalTaskTitle) modalTaskTitle.value = '';
        if (modalTaskObjective) modalTaskObjective.value = '';
        if (modalTaskMission) modalTaskMission.value = '';
        if (taskModalTitle) taskModalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> 새 과제 추가';

        // 모드에 따른 제한 시간 설정
        this.setModalTimeLimitByMode(modalTimeLimit);

        // 모달 내 채점 팁 초기화
        this.clearModalScoringTips();
        this.modalScoringTipCount = 0;

        // 모달 내 세션 초기화
        this.clearModalSessions();
        this.modalSessionCount = 0;

        // 모달 탭 초기화
        this.resetModalTabs();

        // 모달 표시
        modal.classList.remove('modal-hide');
        modal.classList.add('modal-show');
    }

    /**
     * 과제 편집 모달 열기
     */
    editTaskModal(index) {
        const task = this.tasks[index];
        if (!task) return;

        // 모달 폼에 데이터 채우기
        document.getElementById('editTaskIndex').value = index;
        document.getElementById('modalTaskTitle').value = task.title || '';
        document.getElementById('modalTaskObjective').value = task.objective || '';
        document.getElementById('modalTaskMission').value = task.mission || '';
        document.getElementById('taskModalTitle').innerHTML = '<i class="fas fa-edit"></i> 과제 편집';

        // 모드에 따른 제한 시간 설정 (편집 시에도 모드에 따라 제어)
        const modalTimeLimit = document.getElementById('modalTimeLimit');
        this.setModalTimeLimitByMode(modalTimeLimit, task.timeLimit);

        // 모달 내 채점 팁 로드
        this.clearModalScoringTips();
        this.modalScoringTipCount = 0;
        if (task.scoringTips && task.scoringTips.length > 0) {
            task.scoringTips.forEach((tipData) => {
                this.addModalScoringTip(tipData.tip || '');
            });
        }

        // 모달 내 세션 로드
        this.clearModalSessions();
        this.modalSessionCount = 0;
        if (task.sessions && task.sessions.length > 0) {
            task.sessions.forEach((sessionData) => {
                this.addModalSession(sessionData);
            });
        }

        // 모달 탭 초기화
        this.resetModalTabs();

        // 모달 표시
        const modal = document.getElementById('taskModal');
        modal.classList.add('modal-show');
        modal.classList.remove('modal-hide');
    }

    /**
     * 모드에 따른 모달 제한 시간 필드 설정
     * @param {HTMLElement} timeLimitInput - 제한 시간 입력 요소
     * @param {number} existingValue - 기존 값 (편집 시)
     */
    setModalTimeLimitByMode(timeLimitInput, existingValue = null) {
        if (!timeLimitInput) return;

        const docModeSelect = document.getElementById('docMode');
        const currentMode = docModeSelect ? docModeSelect.value : '';

        if (currentMode === '학습모드') {
            // 학습모드: 0으로 고정, 비활성화
            timeLimitInput.value = '0';
            timeLimitInput.disabled = true;
            timeLimitInput.style.backgroundColor = '#f3f4f6';
            timeLimitInput.style.cursor = 'not-allowed';
        } else {
            // 평가모드: 기본값 60분, 활성화
            timeLimitInput.value = existingValue !== null ? existingValue : '60';
            timeLimitInput.disabled = false;
            timeLimitInput.style.backgroundColor = '';
            timeLimitInput.style.cursor = '';
        }
    }

    /**
     * 과제 모달 닫기
     */
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('taskModal 요소를 찾을 수 없습니다!');
            return;
        }
        modal.classList.remove('modal-show');
        modal.classList.add('modal-hide');
    }

    /**
     * 모달 탭 전환
     */
    switchModalTab(tabName) {
        // 탭 버튼 활성화 상태 변경
        const tabs = document.querySelectorAll('.modal-tab');
        tabs.forEach(tab => {
            if (tab.dataset.modalTab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 탭 컨텐츠 표시/숨김
        const contents = document.querySelectorAll('.modal-tab-content');
        contents.forEach(content => {
            if (content.id === `modal-tab-${tabName}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    /**
     * 모달 탭 초기화 (첫 번째 탭으로)
     */
    resetModalTabs() {
        this.switchModalTab('task-info');
    }

    /**
     * 모달 내 채점 팁 초기화
     */
    clearModalScoringTips() {
        const container = document.getElementById('modalScoringTipsContainer');
        const emptyState = document.getElementById('modalScoringTipsEmpty');
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }

    /**
     * 모달 내 채점 팁 추가
     */
    addModalScoringTip(tipValue = '') {
        this.modalScoringTipCount = (this.modalScoringTipCount || 0) + 1;
        const container = document.getElementById('modalScoringTipsContainer');
        const emptyState = document.getElementById('modalScoringTipsEmpty');
        
        if (!container) return;

        const tipId = `modalScoringTip_${this.modalScoringTipCount}`;
        const tipElement = document.createElement('div');
        tipElement.className = 'modal-scoring-tip-item';
        tipElement.dataset.tipId = tipId;
        tipElement.innerHTML = `
            <div class="modal-scoring-tip-header">
                <span class="modal-scoring-tip-label">팁 ${this.modalScoringTipCount}</span>
                <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeModalScoringTip(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <textarea name="${tipId}" rows="2" placeholder="채점 팁을 입력하세요." class="modal-scoring-tip-input">${this.escapeHtml(tipValue)}</textarea>
        `;

        container.appendChild(tipElement);
        if (emptyState) emptyState.style.display = 'none';
    }

    /**
     * 모달 내 채점 팁 삭제
     */
    removeModalScoringTip(button) {
        const item = button.closest('.modal-scoring-tip-item');
        if (item) {
            item.remove();
            
            const container = document.getElementById('modalScoringTipsContainer');
            const emptyState = document.getElementById('modalScoringTipsEmpty');
            if (container && emptyState && container.children.length === 0) {
                emptyState.style.display = 'block';
            }
        }
    }

    /**
     * 모달 내 채점 팁 수집
     */
    collectModalScoringTips() {
        const tips = [];
        const inputs = document.querySelectorAll('#modalScoringTipsContainer .modal-scoring-tip-input');
        inputs.forEach(input => {
            const tip = input.value.trim();
            if (tip) {
                tips.push({ tip });
            }
        });
        return tips;
    }

    /**
     * 모달 내 세션 초기화
     */
    clearModalSessions() {
        const container = document.getElementById('modalSessionsContainer');
        const emptyState = document.getElementById('modalSessionsEmpty');
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }

    /**
     * 모달 내 세션 추가
     */
    addModalSession(sessionData = null) {
        this.modalSessionCount = (this.modalSessionCount || 0) + 1;
        const container = document.getElementById('modalSessionsContainer');
        const emptyState = document.getElementById('modalSessionsEmpty');

        if (!container) return;

        const sessionId = `modalSession_${this.modalSessionCount}`;
        const sessionNumber = this.modalSessionCount;

        const outputReqs = sessionData?.userDisplays?.outputRequirements;

        const sessionElement = document.createElement('div');
        sessionElement.className = 'modal-session-item';
        sessionElement.dataset.sessionId = sessionId;
        sessionElement.id = sessionId;
        sessionElement.innerHTML = `
            <div class="modal-session-header" onclick="window.createAssignmentManager.toggleSessionAccordion('${sessionId}')">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chevron-down accordion-icon" id="${sessionId}_icon"></i>
                    <span class="modal-session-label">세션 ${sessionNumber}</span>
                </div>
                <button type="button" class="btn-remove-small" onclick="event.stopPropagation(); window.createAssignmentManager.removeModalSession(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-session-body" id="${sessionId}_body">
                <div class="form-group">
                    <label>상황 설명 <span class="json-key">[userDisplays.situation]</span></label>
                    <textarea name="${sessionId}_situation" rows="3" placeholder="학습자가 과제를 수행할 때 필요한 배경 정보를 입력하세요." class="modal-session-situation">${sessionData?.userDisplays?.situation ? this.escapeHtml(sessionData.userDisplays.situation) : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>원본 데이터 <span class="json-key">[userDisplays.rawData]</span></label>
                    <div class="modal-rawdata-container" id="${sessionId}_rawdataContainer">
                        ${sessionData?.userDisplays?.rawData ? this.renderRawData(sessionData.userDisplays.rawData, sessionId) : ''}
                    </div>
                    <button type="button" class="btn-add-small" onclick="window.createAssignmentManager.addModalRawDataItem('${sessionId}')">
                        <i class="fas fa-plus"></i> 원본 데이터 추가
                    </button>
                </div>
                <div class="form-group">
                    <label>출력 요구사항 <span class="json-key">[userDisplays.outputRequirements]</span></label>
                    <div class="modal-output-requirements">
                        <!-- AES 요구사항 -->
                        <div class="modal-req-section">
                            <h4>AES 검증 (법적/사회적 리스크 관리)</h4>
                            <div class="form-group">
                                <label>설명 <span class="json-key">[aesRequirements.description]</span></label>
                                <input type="text" name="${sessionId}_aes_description" value="${this.escapeHtml(outputReqs?.aesRequirements?.description || '')}" placeholder="AES 검증에 대한 설명" class="modal-input">
                            </div>
                            <div class="form-group">
                                <label>요구사항 <span class="json-key">[aesRequirements.requirement]</span></label>
                                <textarea name="${sessionId}_aes_requirement" rows="2" placeholder="AES 평가 요구사항" class="modal-textarea">${this.escapeHtml(outputReqs?.aesRequirements?.requirement || '')}</textarea>
                            </div>
                        </div>

                        <!-- ACI 요구사항 -->
                        <div class="modal-req-section">
                            <h4>ACI 요구사항</h4>
                            <div class="form-group">
                                <label>출력 형식 요구사항 <span class="json-key">[aciRequirements.format]</span></label>
                                <div class="modal-sub-req">
                                    <div class="form-group">
                                        <label>설명</label>
                                        <input type="text" name="${sessionId}_aci_format_description" value="${this.escapeHtml(outputReqs?.aciRequirements?.format?.description || '')}" placeholder="형식에 대한 설명" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>스타일</label>
                                        <input type="text" name="${sessionId}_aci_format_style" value="${this.escapeHtml(outputReqs?.aciRequirements?.format?.style || '')}" placeholder="예: 서술형, 개조식 리스트" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>길이</label>
                                        <input type="text" name="${sessionId}_aci_format_length" value="${this.escapeHtml(outputReqs?.aciRequirements?.format?.length || '')}" placeholder="예: 500자 ~ 700자" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>필수 조건 <span class="json-key">[aciRequirements.format.requiredConditions]</span></label>
                                        <div class="modal-required-sections" id="${sessionId}_requiredSections">
                                            ${outputReqs?.aciRequirements?.format?.requiredConditions ? this.renderRequiredSections(outputReqs.aciRequirements.format.requiredConditions, sessionId) : ''}
                                        </div>
                                        <button type="button" class="btn-add-small" data-add-section="${sessionId}">
                                            <i class="fas fa-plus"></i> 조건 추가
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- 필수 표기 사항 -->
                            <div class="form-group">
                                <label>필수 표기 사항 <span class="json-key">[aciRequirements.requiredNotation]</span></label>
                                <div class="modal-sub-req">
                                    <div class="form-group">
                                        <label>설명</label>
                                        <input type="text" name="${sessionId}_aci_notation_description" value="${this.escapeHtml(outputReqs?.aciRequirements?.requiredNotation?.description || '')}" placeholder="필수 표기 사항 설명" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>요구사항</label>
                                        <input type="text" name="${sessionId}_aci_notation_requirement" value="${this.escapeHtml(outputReqs?.aciRequirements?.requiredNotation?.requirement || '')}" placeholder="필수 표기 요구사항" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>텍스트</label>
                                        <input type="text" name="${sessionId}_aci_notation_text" value="${this.escapeHtml(outputReqs?.aciRequirements?.requiredNotation?.text || '')}" placeholder="표기할 텍스트" class="modal-input">
                                    </div>
                                </div>
                            </div>

                            <!-- 데이터 신뢰성 -->
                            <div class="form-group">
                                <label>데이터 신뢰성 <span class="json-key">[aciRequirements.dataReliability]</span></label>
                                <div class="modal-sub-req">
                                    <div class="form-group">
                                        <label>설명</label>
                                        <input type="text" name="${sessionId}_aci_data_description" value="${this.escapeHtml(outputReqs?.aciRequirements?.dataReliability?.description || '')}" placeholder="데이터 신뢰성 설명" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>요구사항</label>
                                        <textarea name="${sessionId}_aci_data_requirement" rows="2" placeholder="데이터 신뢰성 요구사항" class="modal-textarea">${this.escapeHtml(outputReqs?.aciRequirements?.dataReliability?.requirement || '')}</textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- 필수 키워드 -->
                            <div class="form-group">
                                <label>필수 키워드 <span class="json-key">[aciRequirements.requiredKeywords]</span></label>
                                <div class="modal-sub-req">
                                    <div class="form-group">
                                        <label>설명</label>
                                        <input type="text" name="${sessionId}_aci_keywords_description" value="${this.escapeHtml(outputReqs?.aciRequirements?.requiredKeywords?.description || '')}" placeholder="필수 키워드 설명" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>요구사항</label>
                                        <input type="text" name="${sessionId}_aci_keywords_requirement" value="${this.escapeHtml(outputReqs?.aciRequirements?.requiredKeywords?.requirement || '')}" placeholder="필수 키워드 요구사항 (쉼표로 구분)" class="modal-input">
                                    </div>
                                </div>
                            </div>

                            <!-- 제약사항 -->
                            <div class="form-group">
                                <label>제약사항 <span class="json-key">[aciRequirements.constraints]</span></label>
                                <div class="modal-sub-req">
                                    <div class="form-group">
                                        <label>설명</label>
                                        <input type="text" name="${sessionId}_aci_constraints_description" value="${this.escapeHtml(outputReqs?.aciRequirements?.constraints?.description || '')}" placeholder="제약사항 설명" class="modal-input">
                                    </div>
                                    <div class="form-group">
                                        <label>제약조건</label>
                                        <textarea name="${sessionId}_aci_constraints_constraint" rows="2" placeholder="제약조건" class="modal-textarea">${this.escapeHtml(outputReqs?.aciRequirements?.constraints?.constraint || '')}</textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- 채점 기준 추가 영역 -->
                            <div class="modal-constraints-add-area">
                                <div class="add-area-icon">
                                    <i class="fas fa-plus-circle"></i>
                                </div>
                                <p class="add-area-text">채점 기준을 추가하여 평가 기준을 확장하세요</p>
                                <button type="button" class="btn-add-small add-area-button" onclick="window.createAssignmentManager.addScoringCriteria('${sessionId}')">
                                    <i class="fas fa-plus"></i> 채점 기준 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(sessionElement);
        if (emptyState) emptyState.style.display = 'none';

        // 새 세션 추가 시 원본 데이터 1개 기본 생성
        if (!sessionData?.userDisplays?.rawData || sessionData.userDisplays.rawData.length === 0) {
            // DOM이 추가된 후 실행하도록 setTimeout 사용
            setTimeout(() => {
                this.addModalRawDataItem(sessionId);
            }, 0);
        }
    }

    /**
     * 모달 내 세션 삭제
     */
    removeModalSession(button) {
        const item = button.closest('.modal-session-item');
        if (item) {
            item.remove();

            const container = document.getElementById('modalSessionsContainer');
            const emptyState = document.getElementById('modalSessionsEmpty');
            if (container && emptyState && container.children.length === 0) {
                emptyState.style.display = 'block';
            }
        }
    }

    /**
     * 세션 카드 아코디언 토글
     */
    toggleSessionAccordion(sessionId) {
        const sessionElement = document.getElementById(sessionId);
        if (!sessionElement) return;

        // collapsed 클래스 토글
        sessionElement.classList.toggle('collapsed');
    }

    /**
     * 모달 내 원본 데이터 아이템 추가
     */
    addModalRawDataItem(sessionId, rawDataItem = null) {
        const container = document.getElementById(`${sessionId}_rawdataContainer`);
        if (!container) return;

        const rawDataIndex = container.children.length + 1;
        const rawDataElement = document.createElement('div');
        rawDataElement.className = 'modal-rawdata-item';
        rawDataElement.innerHTML = `
            <div class="modal-rawdata-header">
                <span class="modal-rawdata-label">원본 데이터 ${rawDataIndex}</span>
                <button type="button" class="btn-remove-small" onclick="this.closest('.modal-rawdata-item').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <label>출처 <span class="json-key">[rawData.source]</span></label>
                <input type="text" name="${sessionId}_rawdata_source_${rawDataIndex}" value="${this.escapeHtml(rawDataItem?.source || '')}" placeholder="예: 대표님의 메모" class="modal-rawdata-source">
            </div>
            <div class="form-group">
                <label>내용 <span class="json-key">[rawData.content]</span></label>
                <textarea name="${sessionId}_rawdata_content_${rawDataIndex}" rows="3" placeholder="원본 데이터 내용을 입력하세요." class="modal-rawdata-content">${this.escapeHtml(rawDataItem?.content || '')}</textarea>
            </div>
            <div class="form-group">
                <label>리스크 <span class="json-key">[rawData.risks]</span></label>
                <textarea name="${sessionId}_rawdata_risks_${rawDataIndex}" rows="2" placeholder="법적/윤리적 리스크를 입력하세요." class="modal-rawdata-risks">${this.escapeHtml(rawDataItem?.risks || '')}</textarea>
            </div>
            <div class="form-group">
                <label>파일 URL <span class="json-key">[rawData.fileUrl]</span></label>
                <input type="text" name="${sessionId}_rawdata_fileurl_${rawDataIndex}" value="${this.escapeHtml(rawDataItem?.fileUrl || '')}" placeholder="예: ~/s1_Customer_Survey.xlsx" class="modal-rawdata-fileurl">
                ${rawDataItem?.fileUrl ? `<small class="form-hint" style="color: #10b981;"><i class="fas fa-check-circle"></i> 파일 등록됨: ${this.escapeHtml(rawDataItem.fileUrl)}</small>` : '<small class="form-hint">파일 경로가 있을 경우 입력하세요 (선택사항)</small>'}
            </div>
        `;

        container.appendChild(rawDataElement);
    }

    /**
     * 원본 데이터 렌더링 (편집 시)
     */
    renderRawData(rawDataArray, sessionId) {
        if (!Array.isArray(rawDataArray) || rawDataArray.length === 0) return '';

        return rawDataArray.map((item, index) => `
            <div class="modal-rawdata-item">
                <div class="modal-rawdata-header">
                    <span class="modal-rawdata-label">원본 데이터 ${index + 1}</span>
                    <button type="button" class="btn-remove-small" onclick="this.closest('.modal-rawdata-item').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label>출처 <span class="json-key">[rawData.source]</span></label>
                    <input type="text" name="${sessionId}_rawdata_source_${index + 1}" value="${this.escapeHtml(item.source || '')}" placeholder="예: 대표님의 메모" class="modal-rawdata-source">
                </div>
                <div class="form-group">
                    <label>내용 <span class="json-key">[rawData.content]</span></label>
                    <textarea name="${sessionId}_rawdata_content_${index + 1}" rows="3" placeholder="원본 데이터 내용을 입력하세요." class="modal-rawdata-content">${this.escapeHtml(item.content || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>리스크 <span class="json-key">[rawData.risks]</span></label>
                    <textarea name="${sessionId}_rawdata_risks_${index + 1}" rows="2" placeholder="법적/윤리적 리스크를 입력하세요." class="modal-rawdata-risks">${this.escapeHtml(item.risks || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>파일 URL <span class="json-key">[rawData.fileUrl]</span></label>
                    <input type="text" name="${sessionId}_rawdata_fileurl_${index + 1}" value="${this.escapeHtml(item.fileUrl || '')}" placeholder="예: ~/s1_Customer_Survey.xlsx" class="modal-rawdata-fileurl">
                    ${item.fileUrl ? `<small class="form-hint" style="color: #10b981;"><i class="fas fa-check-circle"></i> 파일 등록됨: ${this.escapeHtml(item.fileUrl)}</small>` : '<small class="form-hint">파일 경로가 있을 경우 입력하세요 (선택사항)</small>'}
                </div>
            </div>
        `).join('');
    }

    /**
     * 필수 섹션 렌더링 (편집 시)
     */
    renderRequiredSections(requiredSections, sessionId) {
        if (!Array.isArray(requiredSections) || requiredSections.length === 0) return '';

        return requiredSections.map((section, index) => `
            <div class="modal-required-section-item" data-section-index="${index}">
                <div class="modal-section-header">
                    <span class="modal-section-label">섹션 ${index + 1}</span>
                    <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeRequiredSection('${sessionId}', this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label>순서 <span class="json-key">[order]</span></label>
                    <input type="number" name="${sessionId}_section_order_${index}" value="${section.order || index + 1}" class="modal-input" style="width: 80px;" min="1">
                </div>
                <div class="form-group">
                    <label>제목 <span class="json-key">[title]</span></label>
                    <input type="text" name="${sessionId}_section_title_${index}" value="${this.escapeHtml(section.title || '')}" placeholder="섹션 제목" class="modal-input">
                </div>
                <div class="form-group">
                    <label>내용 <span class="json-key">[content]</span></label>
                    <textarea name="${sessionId}_section_content_${index}" rows="2" placeholder="섹션 내용" class="modal-textarea">${this.escapeHtml(section.content || '')}</textarea>
                </div>
            </div>
        `).join('');
    }

    /**
     * 필수 섹션 추가
     */
    addRequiredSection(sessionId) {
        console.log('addRequiredSection called with sessionId:', sessionId);
        const container = document.getElementById(`${sessionId}_requiredSections`);
        console.log('container found:', container);

        if (!container) {
            console.error('Container not found for sessionId:', sessionId);
            return;
        }

        const sectionIndex = container.children.length;
        console.log('sectionIndex:', sectionIndex);

        const sectionElement = document.createElement('div');
        sectionElement.className = 'modal-required-section-item';
        sectionElement.dataset.sectionIndex = sectionIndex;
        sectionElement.innerHTML = `
            <div class="modal-section-header">
                <span class="modal-section-label">섹션 ${sectionIndex + 1}</span>
                <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeRequiredSection('${sessionId}', this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <label>순서 <span class="json-key">[order]</span></label>
                <input type="number" name="${sessionId}_section_order_${sectionIndex}" value="${sectionIndex + 1}" class="modal-input" style="width: 80px;" min="1">
            </div>
            <div class="form-group">
                <label>제목 <span class="json-key">[title]</span></label>
                <input type="text" name="${sessionId}_section_title_${sectionIndex}" placeholder="섹션 제목" class="modal-input">
            </div>
            <div class="form-group">
                <label>내용 <span class="json-key">[content]</span></label>
                <textarea name="${sessionId}_section_content_${sectionIndex}" rows="2" placeholder="섹션 내용" class="modal-textarea"></textarea>
            </div>
        `;

        container.appendChild(sectionElement);
        console.log('Section appended successfully');
    }

    /**
     * 필수 섹션 삭제
     */
    removeRequiredSection(sessionId, button) {
        const item = button.closest('.modal-required-section-item');
        if (item) {
            item.remove();
            // 섹션 인덱스 재정렬
            const container = document.getElementById(`${sessionId}_requiredSections`);
            if (container) {
                const sections = container.querySelectorAll('.modal-required-section-item');
                sections.forEach((section, newIndex) => {
                    const label = section.querySelector('.modal-section-label');
                    const orderInput = section.querySelector(`input[name^="${sessionId}_section_order_"]`);
                    if (label) label.textContent = `섹션 ${newIndex + 1}`;
                    if (orderInput) orderInput.value = newIndex + 1;
                });
            }
        }
    }

    /**
     * 모달 내 세션 수집
     */
    collectModalSessions() {
        const sessions = [];
        const sessionItems = document.querySelectorAll('#modalSessionsContainer .modal-session-item');

        sessionItems.forEach((sessionItem, index) => {
            const sessionId = sessionItem.dataset.sessionId;

            // 상황 설명 수집
            const situation = sessionItem.querySelector(`[name="${sessionId}_situation"]`)?.value.trim() || '';

            // 원본 데이터 수집
            const rawData = [];
            const rawDataItems = sessionItem.querySelectorAll('.modal-rawdata-item');
            rawDataItems.forEach(rawDataItem => {
                const source = rawDataItem.querySelector('.modal-rawdata-source')?.value.trim() || '';
                const content = rawDataItem.querySelector('.modal-rawdata-content')?.value.trim() || '';
                const risks = rawDataItem.querySelector('.modal-rawdata-risks')?.value.trim() || '';
                const fileUrl = rawDataItem.querySelector('.modal-rawdata-fileurl')?.value.trim() || '';

                if (source || content || risks || fileUrl) {
                    const dataItem = { source, content, risks };
                    if (fileUrl) {
                        dataItem.fileUrl = fileUrl;
                    }
                    rawData.push(dataItem);
                }
            });

            // 출력 요구사항 수집 (구조화된 폼에서)
            const outputRequirements = this.collectOutputRequirements(sessionItem, sessionId);

            if (situation || rawData.length > 0) {
                sessions.push({
                    sessionNumber: index + 1,
                    userDisplays: {
                        situation,
                        rawData,
                        outputRequirements
                    }
                });
            }
        });

        return sessions;
    }

    /**
     * 출력 요구사항 수집
     */
    collectOutputRequirements(sessionItem, sessionId) {
        const getValue = (name) => sessionItem.querySelector(`[name="${sessionId}_${name}"]`)?.value.trim() || '';
        const getTextarea = (name) => sessionItem.querySelector(`[name="${sessionId}_${name}"]`)?.value.trim() || '';

        // AES 요구사항
        const aesRequirements = {
            description: getValue('aes_description'),
            requirement: gettextarea('aes_requirement')
        };

        // 필수 조건 수집
        const requiredConditions = [];
        const sectionItems = sessionItem.querySelectorAll('.modal-required-section-item');
        sectionItems.forEach((sectionItem, index) => {
            const order = parseInt(sectionItem.querySelector(`input[name^="${sessionId}_section_order_"]`)?.value) || index + 1;
            const titleInput = sectionItem.querySelector(`input[name^="${sessionId}_section_title_"]`);
            const contentTextarea = sectionItem.querySelector(`textarea[name^="${sessionId}_section_content_"]`);

            const title = titleInput ? titleInput.value.trim() : '';
            const content = contentTextarea ? contentTextarea.value.trim() : '';

            if (title || content) {
                requiredConditions.push({ order, title, content });
            }
        });

        // order 값으로 정렬
        requiredConditions.sort((a, b) => a.order - b.order);

        // ACI 요구사항
        const aciRequirements = {
            format: {
                description: getValue('aci_format_description'),
                style: getValue('aci_format_style'),
                length: getValue('aci_format_length'),
                requiredConditions: requiredConditions
            },
            requiredNotation: {
                description: getValue('aci_notation_description'),
                requirement: getValue('aci_notation_requirement'),
                text: getValue('aci_notation_text')
            },
            dataReliability: {
                description: getValue('aci_data_description'),
                requirement: gettextarea('aci_data_requirement')
            },
            requiredKeywords: {
                description: getValue('aci_keywords_description'),
                requirement: getValue('aci_keywords_requirement')
            },
            constraints: {
                description: getValue('aci_constraints_description'),
                constraint: gettextarea('aci_constraints_constraint')
            }
        };

        return {
            aesRequirements,
            aciRequirements
        };
    }

    /**
     * 과제 모달 저장
     */
    saveTaskModal() {
        const editIndex = parseInt(document.getElementById('editTaskIndex').value);
        const title = document.getElementById('modalTaskTitle').value.trim();
        const objective = document.getElementById('modalTaskObjective').value.trim();
        const mission = document.getElementById('modalTaskMission').value.trim();
        const timeLimit = parseInt(document.getElementById('modalTimeLimit').value) || 60;

        // 필수 필드 검증
        if (!title || !objective || !mission) {
            this.showError('제목, 목표, 미션은 필수 입력 항목입니다.');
            return;
        }

        // 모달 내 채점 팁 수집
        const scoringTips = this.collectModalScoringTips();

        // 모달 내 세션 수집
        const sessions = this.collectModalSessions();

        if (editIndex === -1) {
            // 새 과제 추가
            const newTask = {
                taskNumber: this.tasks.length + 1,
                title: title,
                objective: objective,
                mission: mission,
                timeLimit: timeLimit,
                scoringTips: scoringTips,
                sessions: sessions
            };
            this.tasks.push(newTask);
            this.selectedTaskIndex = this.tasks.length - 1;
        } else {
            // 기존 과제 수정
            if (this.tasks[editIndex]) {
                this.tasks[editIndex].title = title;
                this.tasks[editIndex].objective = objective;
                this.tasks[editIndex].mission = mission;
                this.tasks[editIndex].timeLimit = timeLimit;
                this.tasks[editIndex].scoringTips = scoringTips;
                this.tasks[editIndex].sessions = sessions;
                this.selectedTaskIndex = editIndex;
            }
        }

        this.updateTasksTable();
        this.updateTaskSelectionUI();
        this.updateJsonPreview();

        // 모달 닫기
        this.closeTaskModal();
    }

    /**
     * 과제 삭제
     */
    removeTask(index) {
        if (!confirm('정말로 이 과제를 삭제하시겠습니까?')) {
            return;
        }

        // 선택된 과제가 삭제되면 선택 해제
        if (this.selectedTaskIndex === index) {
            this.selectedTaskIndex = null;
        } else if (this.selectedTaskIndex > index) {
            this.selectedTaskIndex--;
        }

        this.tasks.splice(index, 1);

        // 과제 번호 재정렬
        this.tasks.forEach((task, idx) => {
            task.taskNumber = idx + 1;
        });

        this.updateTasksTable();
        this.updateTaskSelectionUI();
        this.updateJsonPreview();
    }

    /**
     * 과제 선택
     * Note: 모든 편집은 모달을 통해 수행되므로 선택 시 테이블 하이라이트만 업데이트
     */
    selectTask(index) {
        this.selectedTaskIndex = index;
        this.updateTasksTable();
        this.updateTaskSelectionUI();
    }

    /**
     * 선택된 과제 편집 (모달)
     */
    editTask(index) {
        this.editTaskModal(index);
    }

    /**
     * 현재 폼 데이터를 선택된 과제에 저장
     * Note: 모든 편집은 모달을 통해 수행되므로 이 함수는 더 이상 사용되지 않음
     */
    saveCurrentTaskForm() {
        // 모든 편집은 모달을 통해 수행되므로 별도로 저장할 데이터 없음
        // 모달 저장 시 이미 tasks 배열에 반영됨
    }

    /**
     * 과제 폼에 데이터 로드
     * Note: 모든 편집은 모달을 통해 수행되므로 이 함수는 더 이상 사용되지 않음
     */
    loadTaskForm() {
        // 모든 편집은 모달을 통해 수행되므로 별도로 로드할 데이터 없음
    }

    /**
     * 과제 폼 초기화
     */
    clearTaskForm() {
        // 메인 페이지의 과제 폼 요소들은 더 이상 사용되지 않음
        // 모든 편집은 모달을 통해 수행됨
    }

    /**
     * 과제 목록 테이블 업데이트
     */
    updateTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        const tasksEmpty = document.getElementById('tasksEmpty');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.tasks.length === 0) {
            if (tasksEmpty) tasksEmpty.style.display = 'block';
            return;
        }

        if (tasksEmpty) tasksEmpty.style.display = 'none';

        // 문서 메타데이터에서 모드 읽기
        const docModeSelect = document.getElementById('docMode');
        const currentMode = docModeSelect ? docModeSelect.value : '';

        this.tasks.forEach((task, index) => {
            const tr = document.createElement('tr');
            if (index === this.selectedTaskIndex) {
                tr.classList.add('selected');
            }

            tr.innerHTML = `
                <td class="task-title-cell">${this.escapeHtml(task.title || '(제목 없음)')}</td>
                <td class="mode-cell">${this.escapeHtml(currentMode || '-')}</td>
                <td class="session-count-cell">${task.sessions ? task.sessions.length : 0}</td>
                <td class="actions-cell">
                    <button type="button" class="btn-edit-task" onclick="window.createAssignmentManager.editTask(${index}); return false;">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button type="button" class="btn-delete-task" onclick="window.createAssignmentManager.removeTask(${index}); return false;">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </td>
            `;

            tr.addEventListener('click', (e) => {
                // 버튼 클릭 시 선택하지 않음
                if (e.target.closest('button')) return;
                this.selectTask(index);
            });

            tbody.appendChild(tr);
        });
    }

    /**
     * 과제 선택 UI 업데이트
     * Note: 모든 편집은 모달을 통해 수행되므로 테이블 하이라이트만 관리
     */
    updateTaskSelectionUI() {
        // 테이블 하이라이트는 updateTasksTable()에서 처리됨
        // 추가적인 UI 업데이트가 필요 없음
    }

    // ============================================================
    // 채점 팁(Scoring Tip) 관리 함수
    // ============================================================


    // ============================================================
    // 폼 데이터 수집
    // ============================================================

    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        const form = document.getElementById('assignmentForm');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        // 먼저 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        // 과제 메타데이터
        const now = new Date().toISOString();
        data.docMetadata = {
            title: formData.get('docTitle') || '',
            description: formData.get('docDescription') || '',
            version: formData.get('docVersion') || 'v1.0.0',
            mode: formData.get('docMode') || '',
            competency: formData.get('competencyCode') || '',
            created: now,
            lastModified: now
        };

        // tasks 배열 (복수 과제 지원)
        data.tasks = this.tasks.map((task, index) => ({
            taskNumber: task.taskNumber,
            title: task.title || '',
            objective: task.objective || '',
            mission: task.mission || '',
            timeLimit: task.timeLimit || 0,
            scoringTips: task.scoringTips || [],
            sessions: task.sessions || []
        }));

        return data;
    }

    /**
     * JSON 미리보기 업데이트
     */
    updateJsonPreview() {
        const preview = document.getElementById('jsonPreview');
        if (!preview) return;

        const data = this.collectFormData();
        if (data) {
            preview.textContent = JSON.stringify(data, null, 2);
        }
    }

    /**
     * JSON 다운로드
     */
    downloadJson() {
        // 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency) {
            this.showError('필수 필드를 모두 입력해주세요.');
            return;
        }

        if (data.tasks.length === 0) {
            this.showError('최소한 하나의 과제를 추가해주세요.');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.docMetadata.competency}_${data.docMetadata.mode}_시나리오.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('JSON 파일이 다운로드되었습니다.');
    }

    /**
     * 폼 제출 처리
     */
    handleSubmit(e) {
        e.preventDefault();

        // 현재 선택된 과제의 폼 데이터 저장
        if (this.selectedTaskIndex !== null) {
            this.saveCurrentTaskForm();
        }

        const data = this.collectFormData();
        if (!data) {
            this.showError('데이터를 생성할 수 없습니다.');
            return;
        }

        // 필수 필드 검증
        if (!data.docMetadata.title || !data.docMetadata.competency) {
            this.showError('필수 필드를 모두 입력해주세요.');
            return;
        }

        if (data.tasks.length === 0) {
            this.showError('최소한 하나의 과제를 추가해주세요.');
            return;
        }

        // LocalStorage에 저장
        this.saveToLocalStorage(data);

        this.showSuccess('과제가 저장되었습니다.');

        // 관리자 페이지로 이동
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    }

    /**
     * LocalStorage에 저장
     */
    saveToLocalStorage(data) {
        // 과제 ID 생성
        const assignmentId = `ASG${String(Date.now()).slice(-6)}`;

        // 저장할 데이터 구조
        const assignmentData = {
            id: assignmentId,
            ...data,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // 기존 과제 목록 가져오기
        const existingAssignments = JSON.parse(localStorage.getItem('sandwitchUI_assignments') || '[]');

        // 새 과제 추가
        existingAssignments.push(assignmentData);

        // LocalStorage에 저장
        localStorage.setItem('sandwitchUI_assignments', JSON.stringify(existingAssignments));
    }

    /**
     * 채점 기준 추가
     */
    addScoringCriteria(sessionId) {
        // 모달 표시
        this.showScoringCriteriaModal(sessionId);
    }

    /**
     * 채점 기준 모달 표시
     */
    showScoringCriteriaModal(sessionId) {
        // 모달 HTML 생성
        const modalHtml = `
            <div class="modal modal-show" id="scoringCriteriaModal">
                <div class="modal-overlay" onclick="window.createAssignmentManager.closeScoringCriteriaModal()"></div>
                <div class="modal-container" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-plus-circle"></i> 채점 기준 추가
                        </h3>
                        <button type="button" class="modal-close" onclick="window.createAssignmentManager.closeScoringCriteriaModal()" title="닫기">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="scoringCriteriaForm">
                            <input type="hidden" id="scoringSessionId" value="${sessionId}">

                            <div class="form-group">
                                <label for="scoringCategory">평가 분류 <span class="required">*</span></label>
                                <select id="scoringCategory" class="modal-input" required>
                                    <option value="">선택하세요</option>
                                    <option value="ACI">ACI (결과물 작성 능력)</option>
                                    <option value="AES">AES (법적/사회적 리스크 관리)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="scoringElement">세부 평가 요소 <span class="required">*</span></label>
                                <input type="text" id="scoringElement" class="modal-input" required placeholder="예: 데이터 분석 정확성">
                            </div>

                            <div class="form-group">
                                <label for="scoringGuide">상세 평가 가이드 <span class="required">*</span></label>
                                <textarea id="scoringGuide" class="modal-textarea" rows="4" required placeholder="평가 기준에 대한 상세 가이드라인을 입력하세요"></textarea>
                            </div>

                            <div class="form-group">
                                <label for="scoringPoints">배점 <span class="required">*</span></label>
                                <input type="number" id="scoringPoints" class="modal-input" required min="0" max="100" placeholder="예: 10">
                                <small class="form-hint">0-100 사이의 숫자를 입력하세요</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="window.createAssignmentManager.closeScoringCriteriaModal()">
                            취소
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.createAssignmentManager.saveScoringCriteria()">
                            <i class="fas fa-save"></i> 추가
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 기존 모달이 있다면 제거
        const existingModal = document.getElementById('scoringCriteriaModal');
        if (existingModal) {
            existingModal.remove();
        }

        // body에 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * 채점 기준 모달 닫기
     */
    closeScoringCriteriaModal() {
        const modal = document.getElementById('scoringCriteriaModal');
        if (modal) {
            modal.classList.remove('modal-show');
            modal.classList.add('modal-hide');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * 채점 기준 저장
     */
    saveScoringCriteria() {
        const sessionId = document.getElementById('scoringSessionId').value;
        const category = document.getElementById('scoringCategory').value;
        const element = document.getElementById('scoringElement').value.trim();
        const guide = document.getElementById('scoringGuide').value.trim();
        const points = parseInt(document.getElementById('scoringPoints').value) || 0;

        // 필수 필드 검증
        if (!category || !element || !guide) {
            this.showError('모든 필수 항목을 입력해주세요.');
            return;
        }

        if (points < 0 || points > 100) {
            this.showError('배점은 0-100 사이여야 합니다.');
            return;
        }

        // 세션 요소 찾기
        const sessionElement = document.getElementById(sessionId);
        if (!sessionElement) {
            this.showError('세션을 찾을 수 없습니다.');
            return;
        }

        // 기존 채점 기준 컨테이너 확인
        let criteriaContainer = sessionElement.querySelector('.scoring-criteria-container');
        if (!criteriaContainer) {
            // 채점 기준 추가 영역을 컨테이너로 변경
            const addArea = sessionElement.querySelector('.modal-constraints-add-area');
            if (addArea) {
                addArea.insertAdjacentHTML('beforebegin', `
                    <div class="scoring-criteria-container">
                        <h4 style="margin: 1.5rem 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; font-size: 0.875rem; font-weight: 600; color: #374151;">
                            <i class="fas fa-check-circle"></i> 채점 기준
                        </h4>
                        <div class="scoring-criteria-list"></div>
                    </div>
                `);
                criteriaContainer = sessionElement.querySelector('.scoring-criteria-container');
            }
        }

        // 채점 기준 항목 생성
        const criteriaCount = criteriaContainer.querySelectorAll('.scoring-criteria-item').length + 1;
        const criteriaId = `scoringCriteria_${Date.now()}`;

        const criteriaHtml = `
            <div class="scoring-criteria-item" data-criteria-id="${criteriaId}" style="border: 1px solid #d1d5db; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; background: #f9fafb;">
                <div class="scoring-criteria-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="criteria-badge" style="background: ${category === 'ACI' ? '#dbeafe' : '#fef3c7'}; color: ${category === 'ACI' ? '#1e40af' : '#92400e'}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                            ${category}
                        </span>
                        <span class="criteria-points" style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                            ${points}점
                        </span>
                    </div>
                    <button type="button" class="btn-remove-small" onclick="window.createAssignmentManager.removeScoringCriteria('${criteriaId}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.25rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="scoring-criteria-content">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        ${this.escapeHtml(element)}
                    </div>
                    <div style="color: #6b7280; font-size: 0.8125rem; line-height: 1.5;">
                        ${this.escapeHtml(guide)}
                    </div>
                </div>
            </div>
        `;

        // 채점 기준 목록에 추가
        const criteriaList = criteriaContainer.querySelector('.scoring-criteria-list');
        if (criteriaList) {
            criteriaList.insertAdjacentHTML('beforeend', criteriaHtml);
        }

        // 모달 닫기
        this.closeScoringCriteriaModal();

        this.showSuccess('채점 기준이 추가되었습니다.');
    }

    /**
     * 채점 기준 삭제
     */
    removeScoringCriteria(criteriaId) {
        const criteriaItem = document.querySelector(`[data-criteria-id="${criteriaId}"]`);
        if (criteriaItem) {
            criteriaItem.remove();

            // 채점 기준이 없으면 컨테이너도 제거
            const container = document.querySelector('.scoring-criteria-container');
            if (container) {
                const remainingItems = container.querySelectorAll('.scoring-criteria-item');
                if (remainingItems.length === 0) {
                    container.remove();
                }
            }
        }
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        if (window.modalManager) {
            window.modalManager.error(message);
        } else {
            alert(message);
        }
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        if (window.modalManager) {
            window.modalManager.info(message);
        } else {
            alert(message);
        }
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.createAssignmentManager = new CreateAssignmentManager();
});
