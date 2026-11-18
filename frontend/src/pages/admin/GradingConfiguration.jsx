import React, { useState, useEffect } from 'react';
import { getGradingScales, createGradingScale, updateGradingScale } from '../../services/grading.service';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Sliders, Edit2, CheckCircle2 } from 'lucide-react';

const GradingConfiguration = () => {
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [scaleName, setScaleName] = useState('University Standard Scale');
  const [minOverallPass, setMinOverallPass] = useState(40);
  const [bands, setBands] = useState([
    { minimum_percentage: 90, maximum_percentage: 100, letter_grade: 'O', grade_point: 10, is_passing: true },
    { minimum_percentage: 80, maximum_percentage: 89.99, letter_grade: 'A+', grade_point: 9, is_passing: true },
    { minimum_percentage: 70, maximum_percentage: 79.99, letter_grade: 'A', grade_point: 8, is_passing: true },
    { minimum_percentage: 60, maximum_percentage: 69.99, letter_grade: 'B+', grade_point: 7, is_passing: true },
    { minimum_percentage: 50, maximum_percentage: 59.99, letter_grade: 'B', grade_point: 6, is_passing: true },
    { minimum_percentage: 40, maximum_percentage: 49.99, letter_grade: 'C', grade_point: 5, is_passing: true },
    { minimum_percentage: 0, maximum_percentage: 39.99, letter_grade: 'F', grade_point: 0, is_passing: false },
  ]);

  const toast = useToast();

  const loadScales = async () => {
    setLoading(true);
    try {
      const res = await getGradingScales();
      if (res.data?.success) {
        setScales(res.data.data.scales || res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load grading configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScales();
  }, []);

  const handleOpenEdit = (scale) => {
    setEditingScale(scale);
    setScaleName(scale.scale_name);
    setMinOverallPass(scale.minimum_overall_pass_percentage || 40);
    setBands(scale.bands && scale.bands.length > 0 ? scale.bands : bands);
    setIsModalOpen(true);
  };

  const handleBandChange = (index, field, value) => {
    const updated = [...bands];
    updated[index][field] = value;
    setBands(updated);
  };

  const handleAddBand = () => {
    setBands([
      ...bands,
      { minimum_percentage: 0, maximum_percentage: 0, letter_grade: 'NEW', grade_point: 0, is_passing: true },
    ]);
  };

  const handleRemoveBand = (index) => {
    setBands(bands.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scale_name: scaleName,
        minimum_overall_pass_percentage: minOverallPass,
        bands: bands,
      };

      if (editingScale) {
        await updateGradingScale(editingScale.id, payload);
        toast.success('Grading scale updated successfully');
      } else {
        await createGradingScale(payload);
        toast.success('Grading scale created successfully');
      }
      setIsModalOpen(false);
      loadScales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grading scale');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Grading Scales & Policy Engine
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Define letter grades, grade points, boundaries, and minimum overall passing rules.
          </p>
        </div>
        <Button onClick={() => { setEditingScale(null); setIsModalOpen(true); }} icon={Plus}>
          New Grading Policy
        </Button>
      </div>

      {/* Grid of Scales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {scales.map((scale) => (
          <div
            key={scale.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #D8D8D4',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#101010' }}>
                      {scale.scale_name}
                    </h3>
                    {scale.is_default ? (
                      <span style={{ fontSize: '0.6875rem', padding: '2px 8px', background: '#171717', color: '#FFF', borderRadius: 4, fontWeight: 600 }}>
                        UNIVERSAL DEFAULT
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#858580', marginTop: 4 }}>
                    Minimum Passing Mark: <strong>{scale.minimum_overall_pass_percentage}%</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEdit(scale)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #D8D8D4',
                    background: '#F4F4F1',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Edit2 size={13} /> Edit Scale
                </button>
              </div>

              {/* Bands Table */}
              <div style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Percentage Boundary</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Letter Grade</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Grade Point</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(scale.bands || []).map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #EAEAE7' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>
                          {b.minimum_percentage}% – {b.maximum_percentage}%
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span className={`badge badge-grade-${b.letter_grade}`}>{b.letter_grade}</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          {parseFloat(b.grade_point).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          {b.is_passing ? (
                            <span style={{ color: '#171717', fontWeight: 500 }}>Pass</span>
                          ) : (
                            <span style={{ color: '#555550' }}>Fail</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Configure Scale Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Grading Policy" size="lg">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Policy / Scale Title"
              required
              value={scaleName}
              onChange={(e) => setScaleName(e.target.value)}
            />
            <Input
              label="Min Overall Pass %"
              type="number"
              step="1"
              required
              value={minOverallPass}
              onChange={(e) => setMinOverallPass(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Grade Bands Breakdown</label>
              <button
                type="button"
                onClick={handleAddBand}
                style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#F4F4F1', border: '1px solid #D8D8D4', borderRadius: 4, cursor: 'pointer' }}
              >
                + Add Band
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {bands.map((band, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Min %"
                    value={band.minimum_percentage}
                    onChange={(e) => handleBandChange(idx, 'minimum_percentage', e.target.value)}
                    style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 4, border: '1px solid #D8D8D4' }}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max %"
                    value={band.maximum_percentage}
                    onChange={(e) => handleBandChange(idx, 'maximum_percentage', e.target.value)}
                    style={{ width: '80px', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 4, border: '1px solid #D8D8D4' }}
                  />
                  <input
                    type="text"
                    placeholder="Grade"
                    value={band.letter_grade}
                    onChange={(e) => handleBandChange(idx, 'letter_grade', e.target.value.toUpperCase())}
                    style={{ width: '70px', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 4, border: '1px solid #D8D8D4', fontWeight: 600 }}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Points"
                    value={band.grade_point}
                    onChange={(e) => handleBandChange(idx, 'grade_point', e.target.value)}
                    style={{ width: '70px', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 4, border: '1px solid #D8D8D4' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={band.is_passing}
                      onChange={(e) => handleBandChange(idx, 'is_passing', e.target.checked)}
                    />
                    Pass
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveBand(idx)}
                    style={{ background: 'none', border: 'none', color: '#858580', cursor: 'pointer', fontSize: '1rem', marginLeft: 'auto' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Scale Policy</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradingConfiguration;

